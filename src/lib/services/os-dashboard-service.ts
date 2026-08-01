import { prisma } from '@/lib/prisma'
import type { OSDashboardMetrics } from '@/src/types/os'
import { Decimal } from 'decimal.js'

/**
 * Service for calculating OS dashboard metrics
 */
export class OSDashboardService {
  /**
   * Get comprehensive dashboard metrics for OS module
   */
  static async getDashboardMetrics(companyId: string): Promise<OSDashboardMetrics> {
    const now = new Date()

    // Get all service orders
    const allOS = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        installations: true,
      },
    })

    // Count by status
    const totalOS = allOS.length
    const osEmProducao = allOS.filter((os) => os.status === 'IN_PROGRESS').length
    const osEmInstalacao = allOS.filter((os) => {
      // Check if has active installation stage
      return os.status === 'IN_PROGRESS' && os.installations?.some((inst) => !inst.endDate)
    }).length
    const osConcluidas = allOS.filter((os) => os.status === 'COMPLETED').length
    const osAtrasadas = allOS.filter((os) => {
      // OS is late if scheduled date passed and not completed
      return os.status !== 'COMPLETED' && os.scheduledDate && os.scheduledDate < now
    }).length

    // Calculate values
    let valorEmProducao = new Decimal(0)
    let valorEmInstalacao = new Decimal(0)

    for (const os of allOS) {
      if (os.status === 'IN_PROGRESS') {
        valorEmProducao = valorEmProducao.plus(os.totalValue || 0)
        if (os.installations?.some((inst) => !inst.endDate)) {
          valorEmInstalacao = valorEmInstalacao.plus(os.totalValue || 0)
        }
      }
    }

    return {
      totalOS,
      osEmProducao,
      osEmInstalacao,
      osConcluidas,
      osAtrasadas,
      valorEmProducao: Number(valorEmProducao),
      valorEmInstalacao: Number(valorEmInstalacao),
    }
  }

  /**
   * Get OS by status breakdown
   */
  static async getStatusBreakdown(companyId: string) {
    const osCountByStatus = await prisma.serviceOrder.groupBy({
      by: ['status'],
      where: {
        companyId,
        deletedAt: null,
      },
      _count: true,
      _sum: {
        totalValue: true,
      },
    })

    return osCountByStatus.map((item) => ({
      status: item.status,
      count: item._count,
      totalValue: Number(item._sum?.totalValue || 0),
    }))
  }

  /**
   * Get OS by priority breakdown
   */
  static async getPriorityBreakdown(companyId: string) {
    const osCountByPriority = await prisma.serviceOrder.groupBy({
      by: ['priority'],
      where: {
        companyId,
        deletedAt: null,
      },
      _count: true,
    })

    return osCountByPriority.map((item) => ({
      priority: item.priority || 'NORMAL',
      count: item._count,
    }))
  }

  /**
   * Get OS by vendor breakdown
   */
  static async getVendorBreakdown(companyId: string) {
    const osCountByVendor = await prisma.serviceOrder.groupBy({
      by: ['vendedorId'],
      where: {
        companyId,
        deletedAt: null,
      },
      _count: true,
      _sum: {
        totalValue: true,
      },
    })

    // Fetch vendor names
    const osWithVendors = await Promise.all(
      osCountByVendor.map(async (item) => {
        const vendor = item.vendedorId
          ? await prisma.employee.findUnique({
              where: { id: item.vendedorId },
              select: { name: true },
            })
          : null

        return {
          vendorId: item.vendedorId,
          vendor: vendor?.name || 'Não atribuído',
          count: item._count,
          totalValue: Number(item._sum?.totalValue || 0),
        }
      }),
    )

    return osWithVendors
  }

  /**
   * Get OS timeline (created by date)
   */
  static async getOSTimeline(companyId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const timeline = await prisma.serviceOrder.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        deletedAt: null,
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    })

    // Aggregate by day
    const byDay = new Map<string, number>()
    for (const item of timeline) {
      const day = item.createdAt.toISOString().split('T')[0]
      byDay.set(day, (byDay.get(day) || 0) + item._count)
    }

    return Array.from(byDay.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get recent OS activity
   */
  static async getRecentActivity(companyId: string, limit: number = 5) {
    const recentOS = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        number: true,
        status: true,
        totalValue: true,
        client: {
          select: {
            name: true,
          },
        },
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    })

    return recentOS
  }

  /**
   * Get overdue OS (scheduled date passed)
   */
  static async getOverdueOS(companyId: string) {
    const now = new Date()

    const overdueOS = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: {
          not: 'COMPLETED',
        },
        scheduledDate: {
          lt: now,
        },
      },
      select: {
        id: true,
        number: true,
        scheduledDate: true,
        client: {
          select: {
            name: true,
          },
        },
        priority: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    })

    return overdueOS
  }

  /**
   * Get OS completion rate (by month)
   */
  static async getCompletionRate(companyId: string, months: number = 3) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const osStats = await prisma.serviceOrder.groupBy({
      by: ['status'],
      where: {
        companyId,
        deletedAt: null,
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    })

    const total = osStats.reduce((sum, stat) => sum + stat._count, 0)
    const completed = osStats.find((stat) => stat.status === 'COMPLETED')?._count || 0

    return {
      total,
      completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }
}
