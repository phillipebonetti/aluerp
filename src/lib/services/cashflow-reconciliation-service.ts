import { prisma } from '@/src/lib/prisma'

export class CashFlowReconciliationService {
  static async reconcileMovement(
    companyId: string,
    movementId: string,
    reconciliationNote: string,
    reconciledBy: string
  ) {
    const movement = await prisma.cashMovement.findUnique({
      where: { id: movementId },
    })

    if (!movement) throw new Error('Movimentação não encontrada')

    // Update movement status
    const updated = await prisma.cashMovement.update({
      where: { id: movementId },
      data: {
        status: 'CONFIRMADA',
      },
    })

    // Create reconciliation history record
    await prisma.cashMovement.create({
      data: {
        companyId,
        accountId: movement.accountId,
        type: 'AJUSTE',
        description: `Conciliação: ${reconciliationNote}`,
        value: movement.value,
        sourceType: 'RECONCILIACAO',
        sourceId: movementId,
        status: 'CONFIRMADA',
        movementDate: new Date(),
        confirmedAt: new Date(),
        createdBy: reconciledBy,
      },
    })

    return updated
  }

  static async getUnreconciledCount(companyId: string) {
    return await prisma.cashMovement.count({
      where: {
        companyId,
        status: 'PREVISTA',
      },
    })
  }

  static async getReconciliationSummary(companyId: string) {
    const movements = await prisma.cashMovement.findMany({
      where: { companyId },
    })

    const confirmed = movements.filter((m) => m.status === 'CONFIRMADA').length
    const pending = movements.filter((m) => m.status === 'PREVISTA').length

    return {
      total: movements.length,
      confirmed,
      pending,
      percentageReconciled: ((confirmed / movements.length) * 100).toFixed(1),
    }
  }
}
