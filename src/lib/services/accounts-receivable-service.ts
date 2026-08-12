import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'
import type { AccountsReceivable, ReceivableStatus } from '@/src/types/accounts-receivable'

export class AccountsReceivableService {
  static async createReceivable(data: {
    companyId: string
    clientId: string
    documentNumber: string
    type: string
    category: string
    costCenterId?: string
    quoteId?: string
    serviceOrderId?: string
    totalValue: number
    dueDate: Date
    issueDate?: Date
  }) {
    const receivable = await prisma.accountsReceivable.create({
      data: {
        companyId: data.companyId,
        clientId: data.clientId,
        documentNumber: data.documentNumber,
        type: data.type,
        category: data.category,
        costCenterId: data.costCenterId,
        quoteId: data.quoteId,
        serviceOrderId: data.serviceOrderId,
        totalValue: new Decimal(data.totalValue),
        finalBalance: new Decimal(data.totalValue),
        dueDate: data.dueDate,
        issueDate: data.issueDate || new Date(),
        status: 'ABERTO',
      },
      include: {
        client: true,
        quote: true,
        serviceOrder: true,
      },
    })

    // Create history record
    await this.createHistory({
      companyId: data.companyId,
      accountsReceivableId: receivable.id,
      eventType: 'CREATED',
      description: `Conta a receber criada: R$ ${data.totalValue}`,
      newValue: data.totalValue,
    })

    return receivable
  }

  static async getReceivable(companyId: string, id: string) {
    return await prisma.accountsReceivable.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: true,
        quote: true,
        serviceOrder: true,
        installments: true,
        payments: true,
      },
    })
  }

  static async listReceivables(companyId: string, filters?: {
    status?: ReceivableStatus
    clientId?: string
    overdueOnly?: boolean
    skip?: number
    take?: number
  }) {
    const where: any = { companyId, deletedAt: null }

    if (filters?.status) where.status = filters.status
    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.overdueOnly) {
      where.status = 'VENCIDO'
      where.dueDate = { lt: new Date() }
    }

    return await prisma.accountsReceivable.findMany({
      where,
      include: {
        client: true,
        quote: true,
        serviceOrder: true,
        installments: true,
      },
      orderBy: { dueDate: 'asc' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    })
  }

  static async updateReceivable(
    companyId: string,
    id: string,
    data: Partial<{
      category: string
      costCenterId?: string
      notes?: string
    }>
  ) {
    const receivable = await prisma.accountsReceivable.update({
      where: { id, companyId },
      data,
      include: { client: true },
    })

    await this.createHistory({
      companyId,
      accountsReceivableId: id,
      eventType: 'MODIFIED',
      description: 'Conta a receber modificada',
    })

    return receivable
  }

  static async cancelReceivable(companyId: string, id: string, reason?: string) {
    const receivable = await prisma.accountsReceivable.update({
      where: { id, companyId },
      data: {
        status: 'CANCELADO',
        deletedAt: new Date(),
      },
      include: { client: true },
    })

    await this.createHistory({
      companyId,
      accountsReceivableId: id,
      eventType: 'CANCELLED',
      description: `Conta cancelada. ${reason || ''}`,
    })

    return receivable
  }

  static async registerPayment(data: {
    companyId: string
    accountsReceivableId: string
    installmentId?: string
    amount: number
    paymentMethod: string
    paymentDate: Date
    financialAccountId?: string
    paymentReference?: string
    createdBy: string
  }) {
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: data.accountsReceivableId },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    const payment = await prisma.receivablePayment.create({
      data: {
        accountsReceivableId: data.accountsReceivableId,
        installmentId: data.installmentId,
        companyId: data.companyId,
        amount: new Decimal(data.amount),
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        financialAccountId: data.financialAccountId,
        paymentReference: data.paymentReference,
        createdBy: data.createdBy,
        status: 'CONFIRMADO',
      },
    })

    // Update receivable balances
    const newReceivedValue = receivable.receivedValue.toNumber() + data.amount
    const newBalance = receivable.totalValue.toNumber() - newReceivedValue

    const newStatus: ReceivableStatus =
      newBalance <= 0
        ? 'RECEBIDO'
        : newReceivedValue > 0
          ? 'PARCIALMENTE_RECEBIDO'
          : 'ABERTO'

    const updatedReceivable = await prisma.accountsReceivable.update({
      where: { id: data.accountsReceivableId },
      data: {
        receivedValue: new Decimal(newReceivedValue),
        finalBalance: new Decimal(newBalance),
        status: newStatus,
        receivedDate: newReceivedValue > 0 ? new Date() : null,
      },
      include: { client: true },
    })

    // Create history record
    await this.createHistory({
      companyId: data.companyId,
      accountsReceivableId: data.accountsReceivableId,
      paymentId: payment.id,
      eventType: 'PAYMENT_RECEIVED',
      description: `Recebimento de R$ ${data.amount} via ${data.paymentMethod}`,
      newValue: newReceivedValue,
    })

    return { payment, receivable: updatedReceivable }
  }

  static async reversePayment(companyId: string, paymentId: string, reason?: string) {
    const payment = await prisma.receivablePayment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) throw new Error('Pagamento não encontrado')

    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: payment.accountsReceivableId },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    // Update payment status
    const cancelledPayment = await prisma.receivablePayment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELADO',
        cancelledAt: new Date(),
      },
    })

    // Revert receivable balances
    const newReceivedValue = Math.max(0, receivable.receivedValue.toNumber() - payment.amount.toNumber())
    const newBalance = receivable.totalValue.toNumber() - newReceivedValue

    const newStatus: ReceivableStatus =
      newBalance <= 0
        ? 'RECEBIDO'
        : newReceivedValue > 0
          ? 'PARCIALMENTE_RECEBIDO'
          : 'ABERTO'

    const updatedReceivable = await prisma.accountsReceivable.update({
      where: { id: payment.accountsReceivableId },
      data: {
        receivedValue: new Decimal(newReceivedValue),
        finalBalance: new Decimal(newBalance),
        status: newStatus,
      },
      include: { client: true },
    })

    await this.createHistory({
      companyId,
      accountsReceivableId: payment.accountsReceivableId,
      paymentId,
      eventType: 'PAYMENT_REVERSED',
      description: `Pagamento revertido: R$ ${payment.amount}. ${reason || ''}`,
      newValue: newReceivedValue,
    })

    return { payment: cancelledPayment, receivable: updatedReceivable }
  }

  static async createHistory(data: {
    companyId: string
    accountsReceivableId: string
    paymentId?: string
    eventType: string
    description: string
    previousValue?: number
    newValue?: number
    createdBy?: string
  }) {
    return await prisma.receivableHistory.create({
      data: {
        companyId: data.companyId,
        accountsReceivableId: data.accountsReceivableId,
        paymentId: data.paymentId,
        eventType: data.eventType,
        description: data.description,
        previousValue: data.previousValue ? new Decimal(data.previousValue) : null,
        newValue: data.newValue ? new Decimal(data.newValue) : null,
        createdBy: data.createdBy,
      },
    })
  }

  static async generateInstallments(
    companyId: string,
    accountsReceivableId: string,
    numberOfInstallments: number,
    firstDueDate: Date
  ) {
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: accountsReceivableId },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    const installmentValue = receivable.totalValue.toNumber() / numberOfInstallments
    const installments = []

    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(firstDueDate)
      dueDate.setMonth(dueDate.getMonth() + (i - 1))

      const installment = await prisma.receivableInstallment.create({
        data: {
          accountsReceivableId,
          installmentNumber: i,
          value: new Decimal(installmentValue),
          status: 'ABERTO',
          dueDate,
        },
      })

      installments.push(installment)
    }

    return installments
  }

  static async getInstallments(accountsReceivableId: string) {
    return await prisma.receivableInstallment.findMany({
      where: { accountsReceivableId },
      orderBy: { installmentNumber: 'asc' },
    })
  }

  static async registerInstallmentPayment(
    companyId: string,
    installmentId: string,
    amount: number,
    paymentMethod: string,
    paymentDate: Date,
    createdBy: string
  ) {
    const installment = await prisma.receivableInstallment.findUnique({
      where: { id: installmentId },
      include: { accountsReceivable: true },
    })

    if (!installment) throw new Error('Parcela não encontrada')

    // Register payment
    const payment = await this.registerPayment({
      companyId,
      accountsReceivableId: installment.accountsReceivableId,
      installmentId,
      amount,
      paymentMethod,
      paymentDate,
      createdBy,
    })

    return payment
  }

  static async getSummary(companyId: string) {
    const receivables = await prisma.accountsReceivable.findMany({
      where: { companyId, deletedAt: null },
    })

    const totalReceivable = receivables.reduce((sum, r) => sum + r.totalValue.toNumber(), 0)
    const receivedThisMonth = receivables.reduce((sum, r) => {
      const isThisMonth =
        r.receivedDate &&
        r.receivedDate.getMonth() === new Date().getMonth() &&
        r.receivedDate.getFullYear() === new Date().getFullYear()
      return sum + (isThisMonth ? r.receivedValue.toNumber() : 0)
    }, 0)

    const openAmount = receivables
      .filter(r => r.status === 'ABERTO')
      .reduce((sum, r) => sum + r.finalBalance.toNumber(), 0)

    const overdueAmount = receivables
      .filter(r => r.status === 'VENCIDO')
      .reduce((sum, r) => sum + r.finalBalance.toNumber(), 0)

    return {
      totalReceivable,
      receivedThisMonth,
      openAmount,
      overdueAmount,
    }
  }
}
