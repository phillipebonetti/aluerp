import { prisma } from '@/src/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * CashFlowAutomationService
 * Gerencia a automação de movimentações de caixa baseadas em eventos
 * Integra automaticamente AR, AP e outras fontes
 */
export class CashFlowAutomationService {
  /**
   * Gera movimento de caixa quando um recebimento é registrado
   */
  static async onReceivablePayment(
    companyId: string,
    accountsReceivableId: string,
    paymentId: string,
    amount: Decimal,
    paymentDate: Date,
    paymentMethod: string,
    financialAccountId?: string,
    createdBy?: string
  ) {
    const receivable = await prisma.accountsReceivable.findUnique({
      where: { id: accountsReceivableId },
      include: { client: true },
    })

    if (!receivable) throw new Error('Conta a receber não encontrada')

    // Criar movimento de entrada no caixa
    const movement = await prisma.cashMovement.create({
      data: {
        companyId,
        accountId: financialAccountId || (await this.getDefaultAccount(companyId)),
        type: 'ENTRADA',
        description: `Recebimento - ${receivable.documentNumber} - ${receivable.client.name}`,
        value: amount,
        sourceType: 'RECEBIMENTO_AR',
        sourceId: paymentId,
        status: 'CONFIRMADA',
        movementDate: paymentDate,
        competenceDate: receivable.issueDate,
        confirmedAt: new Date(),
        createdBy: createdBy || 'SISTEMA',
      },
    })

    return movement
  }

  /**
   * Gera movimento de caixa quando um pagamento de AP é registrado
   */
  static async onPayablePayment(
    companyId: string,
    payableId: string,
    paymentId: string,
    amount: Decimal,
    paymentDate: Date,
    paymentMethod: string,
    financialAccountId?: string,
    createdBy?: string
  ) {
    // Criar movimento de saída no caixa
    const movement = await prisma.cashMovement.create({
      data: {
        companyId,
        accountId: financialAccountId || (await this.getDefaultAccount(companyId)),
        type: 'SAIDA',
        description: `Pagamento - Conta a Pagar #${payableId.slice(0, 8)}`,
        value: amount,
        sourceType: 'PAGAMENTO_AP',
        sourceId: paymentId,
        status: 'CONFIRMADA',
        movementDate: paymentDate,
        confirmedAt: new Date(),
        createdBy: createdBy || 'SISTEMA',
      },
    })

    return movement
  }

  /**
   * Reverte um movimento quando pagamento é cancelado
   */
  static async reversePayment(companyId: string, paymentId: string, createdBy?: string) {
    // Buscar movimento original
    const originalMovement = await prisma.cashMovement.findFirst({
      where: {
        companyId,
        sourceId: paymentId,
      },
    })

    if (!originalMovement) return null

    // Criar movimento de estorno (operação reversa)
    const reverseMovement = await prisma.cashMovement.create({
      data: {
        companyId,
        accountId: originalMovement.accountId,
        type: 'AJUSTE',
        description: `Estorno - ${originalMovement.description}`,
        value: originalMovement.value.negated(),
        sourceType: originalMovement.sourceType,
        sourceId: originalMovement.sourceId,
        status: 'CONFIRMADA',
        movementDate: new Date(),
        confirmedAt: new Date(),
        createdBy: createdBy || 'SISTEMA',
      },
    })

    return reverseMovement
  }

  /**
   * Gera movimento manual (quando usuário insere manualmente)
   */
  static async createManualMovement(
    companyId: string,
    accountId: string,
    type: string,
    description: string,
    value: Decimal,
    movementDate: Date,
    categoryId?: string,
    costCenterId?: string,
    createdBy?: string
  ) {
    const movement = await prisma.cashMovement.create({
      data: {
        companyId,
        accountId,
        categoryId,
        costCenterId,
        type,
        description,
        value,
        sourceType: 'MANUAL',
        status: 'PREVISTA',
        movementDate,
        createdBy: createdBy || 'SISTEMA',
      },
    })

    return movement
  }

  /**
   * Busca conta padrão da empresa
   */
  private static async getDefaultAccount(companyId: string) {
    const account = await prisma.financialAccount.findFirst({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!account) throw new Error('Nenhuma conta financeira ativa encontrada')
    return account.id
  }

  /**
   * Sincroniza todas as movimentações pendentes
   */
  static async syncAllPendingMovements(companyId: string) {
    // Buscar recebimentos não sincronizados
    const unsyncedPayments = await prisma.receivablePayment.findMany({
      where: {
        companyId,
        // Verificar se movimento foi criado
      },
      include: {
        accountsReceivable: true,
      },
    })

    let syncedCount = 0

    for (const payment of unsyncedPayments) {
      // Verificar se movimento já existe
      const existingMovement = await prisma.cashMovement.findFirst({
        where: {
          sourceId: payment.id,
          sourceType: 'RECEBIMENTO_AR',
        },
      })

      if (!existingMovement) {
        await this.onReceivablePayment(
          companyId,
          payment.accountsReceivableId,
          payment.id,
          payment.amount,
          payment.paymentDate,
          payment.paymentMethod,
          payment.financialAccountId || undefined
        )
        syncedCount++
      }
    }

    return { syncedCount, message: `${syncedCount} movimentações sincronizadas` }
  }
}
