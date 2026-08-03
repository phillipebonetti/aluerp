import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export class SOCommissionIntegrationService {
  /**
   * Generate commission payment from service order
   */
  static async generateCommissionFromServiceOrder(serviceOrderId: string) {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        vendedor: { include: { salesGoals: true } },
        quote: true,
      },
    })

    if (!serviceOrder) throw new Error('Ordem de serviço não encontrada')
    if (!serviceOrder.vendedorId) throw new Error('Ordem de serviço sem vendedor')

    // Get commission rate
    const commissionRate = serviceOrder.vendedor.commissionRate.toNumber()
    if (commissionRate === 0) return null // No commission

    // Calculate commission
    const baseValue = serviceOrder.value.toNumber()
    const commissionAmount = (baseValue * commissionRate) / 100

    // Get current month for reference
    const now = new Date()
    const referenceMonth = now.getMonth() + 1
    const referenceYear = now.getFullYear()

    // Check if commission payment already exists for this month
    const existingPayment = await prisma.commissionPayment.findFirst({
      where: {
        employeeId: serviceOrder.vendedorId,
        referenceMonth,
        referenceYear,
      },
    })

    if (existingPayment) {
      // Update existing payment
      const newTotal = existingPayment.totalCommission.toNumber() + commissionAmount
      return await prisma.commissionPayment.update({
        where: { id: existingPayment.id },
        data: {
          totalCommission: new Decimal(newTotal),
          approvedCommission: new Decimal(newTotal),
        },
      })
    }

    // Create new commission payment
    const commissionPayment = await prisma.commissionPayment.create({
      data: {
        companyId: serviceOrder.companyId,
        employeeId: serviceOrder.vendedorId,
        referenceMonth,
        referenceYear,
        totalCommission: new Decimal(commissionAmount),
        approvedCommission: new Decimal(commissionAmount),
        paidAmount: new Decimal(0),
        status: 'PENDING',
      },
    })

    // Create history entry
    await prisma.commissionHistory.create({
      data: {
        companyId: serviceOrder.companyId,
        commissionPaymentId: commissionPayment.id,
        employeeId: serviceOrder.vendedorId,
        eventType: 'CREATED',
        description: `Comissão gerada da OS ${serviceOrder.number}`,
        newValue: new Decimal(commissionAmount),
        createdBy: 'SYSTEM',
      },
    })

    return commissionPayment
  }

  /**
   * Calculate commission for service order
   */
  static async calculateCommissionForServiceOrder(serviceOrderId: string): Promise<number> {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: { vendedor: true },
    })

    if (!serviceOrder) throw new Error('Ordem de serviço não encontrada')
    if (!serviceOrder.vendedorId) return 0

    const commissionRate = serviceOrder.vendedor.commissionRate.toNumber()
    const baseValue = serviceOrder.value.toNumber()

    return (baseValue * commissionRate) / 100
  }

  /**
   * Get commission summary for a service order
   */
  static async getServiceOrderCommissionSummary(serviceOrderId: string) {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        vendedor: true,
        osCommissions: true,
      },
    })

    if (!serviceOrder) throw new Error('Ordem de serviço não encontrada')

    const commissionAmount = await this.calculateCommissionForServiceOrder(serviceOrderId)

    // Get commission payment for current month
    const now = new Date()
    const commissionPayment = await prisma.commissionPayment.findFirst({
      where: {
        employeeId: serviceOrder.vendedorId,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
      },
    })

    return {
      vendedor: serviceOrder.vendedor.name,
      commissionRate: serviceOrder.vendedor.commissionRate.toNumber(),
      osValue: serviceOrder.value.toNumber(),
      calculatedCommission: commissionAmount,
      paymentStatus: commissionPayment?.status || 'NOT_CREATED',
      totalMonthlyCommission: commissionPayment?.totalCommission.toNumber() || 0,
    }
  }

  /**
   * Validate service order before commission generation
   */
  static async validateServiceOrderForCommission(
    serviceOrderId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: { vendedor: true },
    })

    if (!serviceOrder) {
      errors.push('Ordem de serviço não encontrada')
      return { valid: false, errors }
    }

    if (!serviceOrder.vendedorId) {
      errors.push('Ordem de serviço sem vendedor')
    }

    if (!serviceOrder.vendedor) {
      errors.push('Vendedor não encontrado')
    }

    if (serviceOrder.vendedor.commissionRate.toNumber() <= 0) {
      errors.push('Vendedor sem percentual de comissão')
    }

    return { valid: errors.length === 0, errors }
  }
}
