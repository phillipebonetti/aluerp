import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'

export class DashboardAdvancedService {
  /**
   * Obter KPIs principais
   */
  static async getMainKPIs(companyId: string) {
    const [totalOS, inProgress, completed, cancelled, overdue] = await Promise.all([
      prisma.serviceOrder.count({ where: { companyId } }),
      prisma.serviceOrder.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      prisma.serviceOrder.count({ where: { companyId, status: 'COMPLETED' } }),
      prisma.serviceOrder.count({ where: { companyId, status: 'CANCELLED' } }),
      prisma.serviceOrder.count({
        where: {
          companyId,
          endDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
    ])

    return {
      totalOS,
      inProgress,
      completed,
      cancelled,
      overdue,
      completionRate: totalOS > 0 ? (completed / totalOS) * 100 : 0,
    }
  }

  /**
   * Obter KPIs financeiros
   */
  static async getFinancialKPIs(companyId: string) {
    const result = await prisma.serviceOrder.aggregate({
      where: { companyId },
      _sum: { totalValue: true },
    })

    const inProgressResult = await prisma.serviceOrder.aggregate({
      where: { companyId, status: 'IN_PROGRESS' },
      _sum: { totalValue: true },
    })

    const completedResult = await prisma.serviceOrder.aggregate({
      where: { companyId, status: 'COMPLETED' },
      _sum: { totalValue: true },
    })

    return {
      totalValue: result._sum.totalValue ? Number(result._sum.totalValue) : 0,
      inProgressValue: inProgressResult._sum.totalValue ? Number(inProgressResult._sum.totalValue) : 0,
      completedValue: completedResult._sum.totalValue ? Number(completedResult._sum.totalValue) : 0,
    }
  }

  /**
   * Obter KPIs por vendedor
   */
  static async getVendorKPIs(companyId: string, limit = 10) {
    const vendors = await prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        serviceOrders: {
          where: {
            serviceOrder: { companyId },
          },
        },
        osCommissions: {
          where: {
            serviceOrder: { companyId },
          },
        },
      },
      take: limit,
    })

    return vendors.map((vendor) => ({
      name: vendor.name,
      totalOS: vendor.serviceOrders.length,
      totalCommission: vendor.osCommissions.reduce((sum, c) => sum + Number(c.commissionValue), 0),
    }))
  }

  /**
   * Obter KPIs de materiais
   */
  static async getMaterialKPIs(companyId: string) {
    const materials = await prisma.oSMaterial.findMany({
      where: {
        serviceOrder: { companyId },
      },
    })

    const totalCost = materials.reduce((sum, m) => sum + Number(m.totalCost), 0)
    const pending = materials.filter((m) => m.status === 'PENDING').length
    const received = materials.filter((m) => m.status === 'RECEIVED').length

    return {
      totalMaterials: materials.length,
      totalCost,
      pending,
      received,
      receiptRate: materials.length > 0 ? (received / materials.length) * 100 : 0,
    }
  }

  /**
   * Obter status breakdown
   */
  static async getStatusBreakdown(companyId: string) {
    const statuses = await prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { companyId },
      _count: true,
    })

    return statuses.map((s) => ({
      status: s.status,
      count: s._count,
    }))
  }

  /**
   * Obter priority breakdown
   */
  static async getPriorityBreakdown(companyId: string) {
    const priorities = await prisma.serviceOrder.groupBy({
      by: ['priority'],
      where: { companyId },
      _count: true,
    })

    return priorities.map((p) => ({
      priority: p.priority || 'NORMAL',
      count: p._count,
    }))
  }

  /**
   * Obter timeline data (últimos 30 dias)
   */
  static async getTimelineData(companyId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const timeline = await prisma.serviceOrder.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    // Group by day
    const grouped = timeline.reduce(
      (acc, item) => {
        const day = new Date(item.createdAt).toISOString().split('T')[0]
        acc[day] = (acc[day] || 0) + item._count
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }))
  }

  /**
   * Obter OS atrasadas
   */
  static async getOverdueOS(companyId: string) {
    const overdue = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        endDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      },
      select: {
        id: true,
        number: true,
        client: { select: { name: true } },
        endDate: true,
        priority: true,
      },
      orderBy: { endDate: 'asc' },
      take: 10,
    })

    return overdue.map((os) => ({
      ...os,
      daysOverdue: Math.floor((Date.now() - new Date(os.endDate || 0).getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }

  /**
   * Obter top clientes (por valor)
   */
  static async getTopClients(companyId: string, limit = 5) {
    const clients = await prisma.client.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        serviceOrders: {
          where: { companyId },
          select: { totalValue: true },
        },
      },
    })

    return clients
      .map((client) => ({
        name: client.name,
        totalValue: client.serviceOrders.reduce((sum, os) => sum + Number(os.totalValue), 0),
        osCount: client.serviceOrders.length,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit)
  }

  /**
   * Obter Performance Index (0-100)
   */
  static async getPerformanceIndex(companyId: string): Promise<number> {
    const [kpis, financial] = await Promise.all([
      this.getMainKPIs(companyId),
      this.getFinancialKPIs(companyId),
    ])

    // Calcular índice baseado em múltiplos fatores
    const completionScore = kpis.completionRate // 0-100
    const noOverdueScore = Math.max(0, 100 - (kpis.overdue * 10)) // penalidade por atraso
    const valueScore = financial.completedValue > 0 ? 50 : 0

    return Math.round((completionScore + noOverdueScore + valueScore) / 3)
  }

  /**
   * Obter relatório executivo
   */
  static async getExecutiveReport(companyId: string) {
    const [kpis, financial, vendors, materials, overdue, topClients, performanceIndex] = await Promise.all([
      this.getMainKPIs(companyId),
      this.getFinancialKPIs(companyId),
      this.getVendorKPIs(companyId, 5),
      this.getMaterialKPIs(companyId),
      this.getOverdueOS(companyId),
      this.getTopClients(companyId, 5),
      this.getPerformanceIndex(companyId),
    ])

    return {
      timestamp: new Date(),
      performanceIndex,
      overview: {
        total: kpis.totalOS,
        inProgress: kpis.inProgress,
        completed: kpis.completed,
        overdue: kpis.overdue,
        completionRate: Math.round(kpis.completionRate * 100) / 100,
      },
      financial: {
        totalValue: financial.totalValue,
        inProgressValue: financial.inProgressValue,
        completedValue: financial.completedValue,
      },
      topVendors: vendors,
      topClients,
      materials: {
        totalCost: materials.totalCost,
        pending: materials.pending,
        receiptRate: Math.round(materials.receiptRate * 100) / 100,
      },
      alerts: {
        overdueOS: overdue,
        overdueCritical: overdue.filter((os) => os.daysOverdue > 7),
      },
    }
  }
}
