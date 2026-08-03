import prisma from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { v4 as uuid } from 'uuid'

export class QuoteReceivableIntegrationService {
  /**
   * Generate receivable account from approved quote
   */
  static async generateReceivableFromQuote(
    quoteId: string,
    numberOfInstallments: number = 1,
    firstDueDate?: Date
  ) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { client: true, items: true },
    })

    if (!quote) throw new Error('Orçamento não encontrado')
    if (quote.status !== 'APROVADO') throw new Error('Apenas orçamentos aprovados podem gerar contas')

    const totalValue = quote.items.reduce((sum, item) => sum + item.value.toNumber() * item.quantity, 0)

    // Create main receivable account
    const receivable = await prisma.accountsReceivable.create({
      data: {
        companyId: quote.companyId,
        clientId: quote.clientId,
        quoteId: quote.id,
        documentNumber: `REC-${Date.now()}`,
        type: 'VENDA',
        totalValue: new Decimal(totalValue),
        finalBalance: new Decimal(totalValue),
        status: 'ABERTO',
        dueDate: firstDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      },
    })

    // Generate installments
    if (numberOfInstallments > 1) {
      await this.generateInstallments(receivable.id, numberOfInstallments, firstDueDate)
    } else {
      // Single installment
      await prisma.receivableInstallment.create({
        data: {
          accountsReceivableId: receivable.id,
          installmentNumber: 1,
          value: new Decimal(totalValue),
          status: 'ABERTO',
          dueDate: receivable.dueDate,
        },
      })
    }

    return receivable
  }

  /**
   * Generate multiple installments for a receivable
   */
  static async generateInstallments(
    accountsReceivableId: string,
    numberOfInstallments: number,
    firstDueDate?: Date
  ) {
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: accountsReceivableId },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    const installmentValue = receivable.totalValue.toNumber() / numberOfInstallments
    const startDate = firstDueDate || receivable.dueDate

    const installments = []
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(startDate)
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

  /**
   * Validate before generating receivable
   */
  static async validateQuoteForReceivable(quoteId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    })

    if (!quote) {
      errors.push('Orçamento não encontrado')
      return { valid: false, errors }
    }

    if (quote.status !== 'APROVADO') {
      errors.push('Apenas orçamentos aprovados podem gerar contas')
    }

    if (!quote.items || quote.items.length === 0) {
      errors.push('Orçamento sem itens não pode gerar conta')
    }

    if (!quote.clientId) {
      errors.push('Orçamento sem cliente não pode gerar conta')
    }

    // Check if receivable already exists
    const existingReceivable = await prisma.accountsReceivable.findFirst({
      where: { quoteId },
    })

    if (existingReceivable) {
      errors.push('Já existe uma conta para este orçamento')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Get quote total value
   */
  static async getQuoteTotalValue(quoteId: string): Promise<number> {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    })

    if (!quote) throw new Error('Orçamento não encontrado')

    return quote.items.reduce((sum, item) => sum + item.value.toNumber() * item.quantity, 0)
  }
}
