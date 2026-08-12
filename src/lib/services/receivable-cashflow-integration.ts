import prisma from '@/lib/prisma'
import { Decimal } from 'decimal.js'

export class ReceivableCashFlowIntegrationService {
  /**
   * Register payment for receivable and sync with CashFlow
   */
  static async registerPaymentWithCashFlow(
    companyId: string,
    accountsReceivableId: string,
    installmentId: string,
    amount: number,
    paymentMethod: string,
    financialAccountId: string,
    paymentDate: Date,
    createdBy: string
  ) {
    // Get receivable and installment
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: accountsReceivableId },
    })

    const installment = await prisma.receivableInstallment.findUnique({
      where: { id: installmentId },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')
    if (!installment) throw new Error('Parcela não encontrada')

    // Validate amount
    const remainingValue = installment.value.toNumber() - installment.receivedValue.toNumber()
    if (amount <= 0 || amount > remainingValue) {
      throw new Error(`Valor inválido. Saldo disponível: R$ ${remainingValue.toFixed(2)}`)
    }

    // Register payment in database
    const payment = await prisma.receivablePayment.create({
      data: {
        accountsReceivableId,
        installmentId,
        companyId,
        amount: new Decimal(amount),
        paymentMethod,
        financialAccountId,
        paymentDate,
        status: 'CONFIRMADO',
        createdBy,
      },
    })

    // Update installment
    const newReceivedValue = installment.receivedValue.toNumber() + amount
    const installmentStatus =
      newReceivedValue >= installment.value.toNumber() ? 'RECEBIDO' : 'PARCIALMENTE_RECEBIDO'

    await prisma.receivableInstallment.update({
      where: { id: installmentId },
      data: {
        receivedValue: new Decimal(newReceivedValue),
        status: installmentStatus,
        receivedDate: paymentDate,
        paymentMethod,
      },
    })

    // Update main receivable
    const currentReceivedValue = receivable.receivedValue.toNumber() + amount
    const receivableStatus = this.calculateReceivableStatus(
      currentReceivedValue,
      receivable.totalValue.toNumber()
    )

    await prisma.accountsReceivable.update({
      where: { id: accountsReceivableId },
      data: {
        receivedValue: new Decimal(currentReceivedValue),
        finalBalance: new Decimal(receivable.totalValue.toNumber() - currentReceivedValue),
        status: receivableStatus,
        receivedDate: receivableStatus === 'RECEBIDO' ? paymentDate : receivable.receivedDate,
      },
    })

    // Create CashMovement entry
    const cashMovement = await prisma.cashMovement.create({
      data: {
        companyId,
        accountId: financialAccountId,
        type: 'ENTRADA',
        description: `Recebimento de ${receivable.documentNumber} - Parcela ${installment.installmentNumber}`,
        value: new Decimal(amount),
        status: 'CONFIRMADA',
        sourceType: 'RECEBIMENTO',
        sourceId: accountsReceivableId,
        movementDate: paymentDate,
        competenceDate: paymentDate,
        confirmedAt: new Date(),
        createdBy,
        confirmedBy: createdBy,
      },
    })

    // Update financial account balance
    const account = await prisma.financialAccount.findUnique({
      where: { id: financialAccountId },
    })

    if (account) {
      await prisma.financialAccount.update({
        where: { id: financialAccountId },
        data: {
          balance: account.balance.toNumber() + amount,
        },
      })
    }

    // Create history entry
    await prisma.receivableHistory.create({
      data: {
        accountsReceivableId,
        paymentId: payment.id,
        companyId,
        eventType: 'PAYMENT_RECEIVED',
        description: `Recebimento de R$ ${amount.toFixed(2)} via ${paymentMethod}`,
        newValue: new Decimal(currentReceivedValue),
        createdBy,
      },
    })

    return {
      payment,
      cashMovement,
      updatedReceivable: { status: receivableStatus },
    }
  }

  /**
   * Reverse a payment and update CashFlow
   */
  static async reversePaymentWithCashFlow(
    companyId: string,
    paymentId: string,
    reason: string,
    cancelledBy: string
  ) {
    const payment = await prisma.receivablePayment.findUnique({
      where: { id: paymentId },
      include: { installment: { include: { accountsReceivable: true } } },
    })

    if (!payment) throw new Error('Pagamento não encontrado')

    // Reverse CashMovement
    const cashMovement = await prisma.cashMovement.findFirst({
      where: {
        sourceType: 'RECEBIMENTO',
        sourceId: payment.accountsReceivableId,
      },
    })

    if (cashMovement) {
      await prisma.cashMovement.update({
        where: { id: cashMovement.id },
        data: {
          status: 'CANCELADA',
        },
      })
    }

    // Update financial account
    if (payment.financialAccountId) {
      const account = await prisma.financialAccount.findUnique({
        where: { id: payment.financialAccountId },
      })

      if (account) {
        await prisma.financialAccount.update({
          where: { id: payment.financialAccountId },
          data: {
            balance: account.balance.toNumber() - payment.amount.toNumber(),
          },
        })
      }
    }

    // Update installment
    const installment = payment.installment
    if (installment) {
      const newReceivedValue = Math.max(0, installment.receivedValue.toNumber() - payment.amount.toNumber())
      await prisma.receivableInstallment.update({
        where: { id: installment.id },
        data: {
          receivedValue: new Decimal(newReceivedValue),
          status: newReceivedValue > 0 ? 'PARCIALMENTE_RECEBIDO' : 'ABERTO',
        },
      })
    }

    // Update main receivable
    const receivable = payment.installment?.accountsReceivable
    if (receivable) {
      const newReceivedValue = Math.max(0, receivable.receivedValue.toNumber() - payment.amount.toNumber())
      const status = this.calculateReceivableStatus(newReceivedValue, receivable.totalValue.toNumber())

      await prisma.accountsReceivable.update({
        where: { id: receivable.id },
        data: {
          receivedValue: new Decimal(newReceivedValue),
          finalBalance: new Decimal(receivable.totalValue.toNumber() - newReceivedValue),
          status,
        },
      })
    }

    // Cancel payment
    const cancelledPayment = await prisma.receivablePayment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELADO',
        cancelledBy,
        cancelledAt: new Date(),
        notes: reason,
      },
    })

    // Create history entry
    await prisma.receivableHistory.create({
      data: {
        accountsReceivableId: payment.accountsReceivableId,
        paymentId,
        companyId,
        eventType: 'PAYMENT_REVERSED',
        description: `Estorno de R$ ${payment.amount.toFixed(2)} - ${reason}`,
        previousValue: new Decimal(receivable?.receivedValue.toNumber() || 0),
        newValue: new Decimal(Math.max(0, (receivable?.receivedValue.toNumber() || 0) - payment.amount.toNumber())),
        createdBy: cancelledBy,
      },
    })

    return cancelledPayment
  }

  /**
   * Calculate receivable status based on payment
   */
  private static calculateReceivableStatus(receivedValue: number, totalValue: number): string {
    if (receivedValue <= 0) return 'ABERTO'
    if (receivedValue >= totalValue) return 'RECEBIDO'
    return 'PARCIALMENTE_RECEBIDO'
  }

  /**
   * Generate commission after payment confirmation
   */
  static async generateCommissionAfterPayment(accountsReceivableId: string, createdBy: string) {
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: accountsReceivableId },
      include: { serviceOrder: { include: { vendedor: true } } },
    })

    if (!receivable || !receivable.serviceOrderId) return null

    const serviceOrder = receivable.serviceOrder
    if (!serviceOrder || !serviceOrder.vendedorId) return null

    const commissionRate = serviceOrder.vendedor.commissionRate.toNumber()
    if (commissionRate <= 0) return null

    // Calculate commission based on received value
    const commissionAmount = (receivable.receivedValue.toNumber() * commissionRate) / 100

    // Get current month
    const now = new Date()
    const referenceMonth = now.getMonth() + 1
    const referenceYear = now.getFullYear()

    // Update or create commission payment
    let commissionPayment = await prisma.commissionPayment.findFirst({
      where: {
        employeeId: serviceOrder.vendedorId,
        referenceMonth,
        referenceYear,
      },
    })

    if (commissionPayment) {
      commissionPayment = await prisma.commissionPayment.update({
        where: { id: commissionPayment.id },
        data: {
          approvedCommission: new Decimal(commissionPayment.approvedCommission.toNumber() + commissionAmount),
        },
      })
    } else {
      commissionPayment = await prisma.commissionPayment.create({
        data: {
          companyId: receivable.companyId,
          employeeId: serviceOrder.vendedorId,
          referenceMonth,
          referenceYear,
          totalCommission: new Decimal(commissionAmount),
          approvedCommission: new Decimal(commissionAmount),
          paidAmount: new Decimal(0),
          status: 'APPROVED',
        },
      })
    }

    return commissionPayment
  }
}
