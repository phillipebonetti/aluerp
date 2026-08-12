import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'

export class ARCashflowIntegrationService {
  /**
   * Automatically create CashMovement when a payment is registered
   */
  static async syncPaymentToCashflow(data: {
    companyId: string
    accountsReceivableId: string
    amount: number
    paymentMethod: string
    financialAccountId?: string
    paymentDate: Date
    paymentReference?: string
  }) {
    // Find the accounts receivable
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: data.accountsReceivableId },
      include: { client: true },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    // Create cash movement (ENTRADA)
    const cashMovement = await prisma.cashMovement.create({
      data: {
        companyId: data.companyId,
        accountId: data.financialAccountId || '', // Will be handled by unique constraint
        type: 'ENTRADA',
        description: `Recebimento de ${receivable.client.name} - Doc: ${receivable.documentNumber}`,
        value: new Decimal(data.amount),
        sourceType: 'RECEBIMENTO',
        sourceId: data.accountsReceivableId,
        status: 'CONFIRMADA',
        movementDate: data.paymentDate,
        competenceDate: data.paymentDate,
        confirmedAt: new Date(),
        notes: `Forma: ${data.paymentMethod}, Ref: ${data.paymentReference || 'N/A'}`,
      },
    })

    // Update financial account balance if provided
    if (data.financialAccountId) {
      const account = await prisma.financialAccount.findUnique({
        where: { id: data.financialAccountId },
      })

      if (account) {
        const newBalance = account.balance.toNumber() + data.amount
        await prisma.financialAccount.update({
          where: { id: data.financialAccountId },
          data: {
            balance: new Decimal(newBalance),
          },
        })
      }
    }

    return cashMovement
  }

  /**
   * Reverse the CashMovement when a payment is reversed
   */
  static async reverseCashflowMovement(
    companyId: string,
    accountsReceivableId: string,
    amount: number
  ) {
    // Find the original cash movement
    const cashMovement = await prisma.cashMovement.findFirst({
      where: {
        companyId,
        sourceId: accountsReceivableId,
        type: 'ENTRADA',
        status: 'CONFIRMADA',
      },
    })

    if (!cashMovement) throw new Error('Movimentação de caixa não encontrada')

    // Update cash movement to cancelled
    const updatedMovement = await prisma.cashMovement.update({
      where: { id: cashMovement.id },
      data: {
        status: 'CANCELADA',
      },
    })

    // Reverse financial account balance if present
    if (cashMovement.accountId) {
      const account = await prisma.financialAccount.findUnique({
        where: { id: cashMovement.accountId },
      })

      if (account) {
        const newBalance = account.balance.toNumber() - amount
        await prisma.financialAccount.update({
          where: { id: cashMovement.accountId },
          data: {
            balance: new Decimal(newBalance),
          },
        })
      }
    }

    return updatedMovement
  }

  /**
   * Get cash flow summary for AR module
   */
  static async getARCashflowSummary(companyId: string) {
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        sourceType: 'RECEBIMENTO',
        status: 'CONFIRMADA',
      },
    })

    const thisMonth = new Date()
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)

    const totalReceived = movements.reduce((sum, m) => sum + m.value.toNumber(), 0)
    const receivedThisMonth = movements
      .filter(m => m.movementDate >= thisMonthStart)
      .reduce((sum, m) => sum + m.value.toNumber(), 0)

    return {
      totalReceived,
      receivedThisMonth,
      movementCount: movements.length,
    }
  }
}
