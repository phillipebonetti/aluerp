import { prisma } from '@/lib/prisma'
import type { Decimal } from '@prisma/client/runtime/library'

export class CommissionCalculationService {
  /**
   * Calcula a comissão baseado em regra e valor
   */
  static async calculateCommission(employeeId: string, osValue: Decimal | number): Promise<number> {
    const osValueNum = typeof osValue === 'string' ? parseFloat(osValue) : Number(osValue)

    // Buscar regra ativa do vendedor
    const rule = await prisma.commissionRule.findFirst({
      where: {
        employeeId,
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: new Date() } },
        ],
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!rule) {
      // Usar comissão padrão do employee
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
      })
      return (osValueNum * Number(employee?.commissionRate || 0)) / 100
    }

    // Validar limites mín/máx
    if (rule.minValue && osValueNum < Number(rule.minValue)) {
      return 0
    }
    if (rule.maxValue && osValueNum > Number(rule.maxValue)) {
      return 0
    }

    // Calcular baseado no tipo de regra
    switch (rule.ruleType) {
      case 'PERCENTAGE':
        return (osValueNum * Number(rule.basePercentage)) / 100

      case 'FIXED':
        return Number(rule.basePercentage)

      case 'TIERED': {
        let commission = 0
        let remaining = osValueNum

        // Tier 1
        if (rule.tier1UpTo && rule.tier1Percentage) {
          const tierAmount = Math.min(remaining, Number(rule.tier1UpTo))
          commission += (tierAmount * Number(rule.tier1Percentage)) / 100
          remaining -= tierAmount
        }

        // Tier 2
        if (rule.tier2UpTo && rule.tier2Percentage && remaining > 0) {
          const tierAmount = Math.min(remaining, Number(rule.tier2UpTo))
          commission += (tierAmount * Number(rule.tier2Percentage)) / 100
          remaining -= tierAmount
        }

        // Tier 3
        if (rule.tier3Percentage && remaining > 0) {
          commission += (remaining * Number(rule.tier3Percentage)) / 100
        }

        return commission
      }

      default:
        return 0
    }
  }

  /**
   * Cria comissão automaticamente quando OS é gerada
   */
  static async createCommissionFromServiceOrder(serviceOrderId: string) {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        osCommissions: true,
        vendor: true,
      },
    })

    if (!serviceOrder?.vendedorId) {
      console.log('Service order has no vendor')
      return null
    }

    // Verificar se já existe comissão
    const existing = await prisma.osCommission.findUnique({
      where: {
        serviceOrderId_vendedorId: {
          serviceOrderId,
          vendedorId: serviceOrder.vendedorId,
        },
      },
    })

    if (existing) {
      console.log('Commission already exists for this service order')
      return existing
    }

    // Calcular comissão
    const commissionValue = await this.calculateCommission(
      serviceOrder.vendedorId,
      serviceOrder.totalValue
    )

    // Criar OSCommission
    const commission = await prisma.osCommission.create({
      data: {
        serviceOrderId,
        vendedorId: serviceOrder.vendedorId,
        osValue: serviceOrder.totalValue,
        commissionRate: (commissionValue / Number(serviceOrder.totalValue)) * 100 || 0,
        commissionValue: commissionValue,
        status: 'PENDING',
      },
    })

    // Registrar no histórico
    await prisma.commissionHistory.create({
      data: {
        companyId: serviceOrder.companyId,
        employeeId: serviceOrder.vendedorId,
        osCommissionId: commission.id,
        eventType: 'CREATED',
        description: `Comissão criada automaticamente para OS ${serviceOrder.number}`,
        newValue: commissionValue,
      },
    })

    return commission
  }

  /**
   * Libera comissão para pagamento
   */
  static async releaseCommission(osCommissionId: string, approvedBy?: string) {
    const commission = await prisma.osCommission.update({
      where: { id: osCommissionId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    })

    // Registrar no histórico
    await prisma.commissionHistory.create({
      data: {
        companyId: commission.vendedorId, // Este será atualizado com o companyId correto
        employeeId: commission.vendedorId,
        osCommissionId,
        eventType: 'APPROVED',
        description: 'Comissão liberada para pagamento',
        newValue: Number(commission.commissionValue),
        createdBy: approvedBy,
      },
    })

    return commission
  }

  /**
   * Agrupa comissões por mês para pagamento
   */
  static async aggregateMonthlyCommissions(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const commissions = await prisma.osCommission.findMany({
      where: {
        vendedorId: employeeId,
        serviceOrder: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        status: { in: ['APPROVED', 'PAID'] },
      },
      include: {
        serviceOrder: true,
      },
    })

    const totalCommission = commissions.reduce((sum, c) => sum + Number(c.commissionValue), 0)
    const totalValue = commissions.reduce((sum, c) => sum + Number(c.osValue), 0)

    return {
      employeeId,
      referenceMonth: month,
      referenceYear: year,
      totalCommission,
      totalValue,
      count: commissions.length,
      commissions,
    }
  }

  /**
   * Cria pagamento mensal agrupado
   */
  static async createMonthlyPayment(
    companyId: string,
    employeeId: string,
    year: number,
    month: number
  ) {
    const aggregated = await this.aggregateMonthlyCommissions(employeeId, year, month)

    // Criar payment
    const payment = await prisma.commissionPayment.create({
      data: {
        companyId,
        employeeId,
        referenceMonth: month,
        referenceYear: year,
        totalCommission: aggregated.totalCommission,
        approvedCommission: 0,
        paidAmount: 0,
        status: 'PENDING',
      },
    })

    // Registrar no histórico
    await prisma.commissionHistory.create({
      data: {
        companyId,
        employeeId,
        commissionPaymentId: payment.id,
        eventType: 'CREATED',
        description: `Comissão mensal de ${month}/${year} - Total: R$ ${aggregated.totalCommission.toFixed(2)}`,
        newValue: aggregated.totalCommission,
      },
    })

    return payment
  }
}
