import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'
import type { CommissionStatus } from '@/src/types/os'

export class CommissionService {
  /**
   * Criar comissão automaticamente quando OS é criada
   */
  static async createCommission(data: {
    serviceOrderId: string
    vendedorId: string
    osValue: number
    commissionRate?: number
  }) {
    // Get commission rate from employee if not provided
    let commissionRate = data.commissionRate ?? 5.0

    if (!data.commissionRate) {
      const employee = await prisma.employee.findUnique({
        where: { id: data.vendedorId },
        select: { comissaoPercentual: true },
      })
      if (employee?.comissaoPercentual) {
        commissionRate = employee.comissaoPercentual
      }
    }

    const commissionValue = new Decimal(data.osValue).times(new Decimal(commissionRate)).dividedBy(100)

    return await prisma.oSCommission.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        vendedorId: data.vendedorId,
        osValue: new Decimal(data.osValue),
        commissionRate: commissionRate,
        commissionValue: commissionValue,
        status: 'PENDING',
      },
      include: {
        vendedor: {
          select: { id: true, name: true },
        },
      },
    })
  }

  /**
   * Listar comissões de uma OS
   */
  static async listCommissions(serviceOrderId: string) {
    return await prisma.oSCommission.findMany({
      where: { serviceOrderId },
      include: {
        vendedor: {
          select: { id: true, name: true },
        },
      },
    })
  }

  /**
   * Obter comissão específica
   */
  static async getCommission(id: string) {
    return await prisma.oSCommission.findUnique({
      where: { id },
      include: {
        vendedor: {
          select: { id: true, name: true },
        },
      },
    })
  }

  /**
   * Aprovar comissão
   */
  static async approveCommission(id: string, approvedBy: string) {
    return await prisma.oSCommission.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        vendedor: {
          select: { id: true, name: true },
        },
      },
    })
  }

  /**
   * Marcar comissão como paga
   */
  static async payCommission(id: string, paidAt: Date = new Date()) {
    return await prisma.oSCommission.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt,
      },
      include: {
        vendedor: {
          select: { id: true, name: true },
        },
      },
    })
  }

  /**
   * Cancelar comissão
   */
  static async cancelCommission(id: string, notes?: string) {
    return await prisma.oSCommission.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes,
      },
    })
  }

  /**
   * Calcular comissão total de uma OS
   */
  static async getTotalCommission(serviceOrderId: string): Promise<number> {
    const result = await prisma.oSCommission.aggregate({
      where: { serviceOrderId, status: { not: 'CANCELLED' } },
      _sum: { commissionValue: true },
    })

    return result._sum.commissionValue ? Number(result._sum.commissionValue) : 0
  }

  /**
   * Obter estatísticas de comissões por vendedor
   */
  static async getCommissionsStats(serviceOrderId: string) {
    const commissions = await this.listCommissions(serviceOrderId)

    const stats = {
      total: commissions.length,
      pending: commissions.filter((c) => c.status === 'PENDING').length,
      approved: commissions.filter((c) => c.status === 'APPROVED').length,
      paid: commissions.filter((c) => c.status === 'PAID').length,
      cancelled: commissions.filter((c) => c.status === 'CANCELLED').length,
      totalValue: await this.getTotalCommission(serviceOrderId),
      byVendor: commissions.reduce(
        (acc, c) => {
          if (!acc[c.vendedorId]) {
            acc[c.vendedorId] = {
              name: c.vendedor?.name || 'Desconhecido',
              totalCommission: 0,
              status: {},
            }
          }
          acc[c.vendedorId].totalCommission += Number(c.commissionValue)
          acc[c.vendedorId].status[c.status] = (acc[c.vendedorId].status[c.status] || 0) + 1
          return acc
        },
        {} as Record<string, any>
      ),
    }

    return stats
  }

  /**
   * Recalcular comissão (útil se taxa mudar ou valor da OS mudar)
   */
  static async recalculateCommission(id: string, newOsValue?: number, newRate?: number) {
    const commission = await this.getCommission(id)
    if (!commission) throw new Error('Comissão não encontrada')

    const osValue = newOsValue ?? Number(commission.osValue)
    const rate = newRate ?? commission.commissionRate
    const newCommissionValue = new Decimal(osValue).times(new Decimal(rate)).dividedBy(100)

    return await prisma.oSCommission.update({
      where: { id },
      data: {
        osValue: new Decimal(osValue),
        commissionRate: rate,
        commissionValue: newCommissionValue,
      },
    })
  }

  /**
   * Gerar relatório de comissões por período
   */
  static async getCommissionReport(
    companyId: string,
    startDate: Date,
    endDate: Date,
    vendedorId?: string
  ) {
    const commissions = await prisma.oSCommission.findMany({
      where: {
        serviceOrder: {
          companyId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        vendedorId: vendedorId,
        status: { not: 'CANCELLED' },
      },
      include: {
        vendedor: true,
        serviceOrder: true,
      },
    })

    const reportData = commissions.reduce(
      (acc, c) => {
        const vendorId = c.vendedorId
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: c.vendedor.name,
            totalCommissions: 0,
            count: 0,
            paid: 0,
            pending: 0,
            approved: 0,
          }
        }

        acc[vendorId].totalCommissions += Number(c.commissionValue)
        acc[vendorId].count += 1

        if (c.status === 'PAID') acc[vendorId].paid += 1
        if (c.status === 'PENDING') acc[vendorId].pending += 1
        if (c.status === 'APPROVED') acc[vendorId].approved += 1

        return acc
      },
      {} as Record<string, any>
    )

    return {
      period: { start: startDate, end: endDate },
      reportData: Object.values(reportData),
      totals: {
        vendors: Object.keys(reportData).length,
        commissions: commissions.length,
        totalValue: commissions.reduce((sum, c) => sum + Number(c.commissionValue), 0),
      },
    }
  }

  /**
   * Bulk aprovar comissões (ex: todas pendentes de um mês)
   */
  static async bulkApproveCommissions(serviceOrderIds: string[], approvedBy: string) {
    return await prisma.oSCommission.updateMany({
      where: {
        serviceOrderId: { in: serviceOrderIds },
        status: 'PENDING',
      },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    })
  }

  /**
   * Bulk pagar comissões
   */
  static async bulkPayCommissions(commissionIds: string[]) {
    return await prisma.oSCommission.updateMany({
      where: {
        id: { in: commissionIds },
        status: 'APPROVED',
      },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })
  }
}
