import { prisma } from '@/lib/prisma'

/**
 * Integração de comissões com o módulo Financeiro
 * Criação automática de despesas ao marcar comissão como paga
 */
export class CommissionFinancialIntegration {
  /**
   * Cria uma despesa no módulo Financeiro ao pagar comissão
   */
  static async createExpenseForCommission(
    commissionPaymentId: string,
    paidVia: string,
    paymentReference?: string
  ) {
    try {
      // Buscar dados da comissão
      const payment = await prisma.commissionPayment.findUnique({
        where: { id: commissionPaymentId },
        include: { employee: true },
      })

      if (!payment) {
        throw new Error('Comissão não encontrada')
      }

      // Verificar se já existe despesa
      const existingExpense = await this.findExistingExpense(commissionPaymentId)
      if (existingExpense) {
        return existingExpense
      }

      // Criar despesa na tabela Transaction (assumindo que é onde as despesas são armazenadas)
      const expense = await prisma.transaction.create({
        data: {
          companyId: payment.companyId,
          type: 'EXPENSE',
          category: 'COMMISSION',
          description: `Comissão de ${payment.employee.name} - Período ${payment.referenceMonth}/${payment.referenceYear}`,
          amount: Number(payment.paidAmount),
          date: new Date(),
          status: 'COMPLETED',
          paymentMethod: paidVia,
          reference: paymentReference || `COM-${commissionPaymentId}`,
          notes: `ID Comissão: ${commissionPaymentId}\nVendedor: ${payment.employee.name}`,
        },
      })

      // Registrar no histórico
      await prisma.commissionHistory.create({
        data: {
          companyId: payment.companyId,
          employeeId: payment.employeeId,
          commissionPaymentId: payment.id,
          eventType: 'PAID',
          description: `Comissão paga - Despesa financeira criada (ID: ${expense.id})`,
          newValue: Number(payment.paidAmount),
          metadata: JSON.stringify({
            expenseId: expense.id,
            paymentMethod: paidVia,
            reference: paymentReference,
          }),
        },
      })

      // Atualizar comissão como paga
      await prisma.commissionPayment.update({
        where: { id: commissionPaymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paidVia,
          paymentReference,
        },
      })

      return expense
    } catch (error) {
      console.error('Erro ao criar despesa de comissão:', error)
      throw error
    }
  }

  /**
   * Estorna uma despesa ao reverter pagamento de comissão
   */
  static async reverseCommissionExpense(commissionPaymentId: string, reason: string) {
    try {
      const payment = await prisma.commissionPayment.findUnique({
        where: { id: commissionPaymentId },
        include: { employee: true },
      })

      if (!payment) {
        throw new Error('Comissão não encontrada')
      }

      // Buscar despesa associada
      const expense = await this.findExistingExpense(commissionPaymentId)

      if (expense) {
        // Criar despesa reversa (negativa)
        await prisma.transaction.create({
          data: {
            companyId: payment.companyId,
            type: 'EXPENSE_REVERSE',
            category: 'COMMISSION',
            description: `Estorno de comissão - ${payment.employee.name}`,
            amount: Number(payment.paidAmount) * -1,
            date: new Date(),
            status: 'COMPLETED',
            reference: `REVERSE-${commissionPaymentId}`,
            notes: `Motivo: ${reason}\nDespesa original: ${expense.id}`,
          },
        })
      }

      // Atualizar status da comissão
      await prisma.commissionPayment.update({
        where: { id: commissionPaymentId },
        data: {
          status: 'PENDING',
          paidAt: null,
          paidVia: null,
        },
      })

      // Registrar no histórico
      await prisma.commissionHistory.create({
        data: {
          companyId: payment.companyId,
          employeeId: payment.employeeId,
          commissionPaymentId: payment.id,
          eventType: 'REVERSED',
          description: `Comissão estornada - Motivo: ${reason}`,
          newValue: 0,
          metadata: JSON.stringify({ reason }),
        },
      })

      return { success: true, message: 'Comissão estornada com sucesso' }
    } catch (error) {
      console.error('Erro ao estornar comissão:', error)
      throw error
    }
  }

  /**
   * Busca despesa existente associada à comissão
   */
  private static async findExistingExpense(commissionPaymentId: string) {
    const history = await prisma.commissionHistory.findFirst({
      where: {
        commissionPaymentId,
        eventType: 'PAID',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!history || !history.metadata) {
      return null
    }

    try {
      const metadata = JSON.parse(history.metadata)
      return metadata.expenseId
    } catch {
      return null
    }
  }

  /**
   * Calcula impacto total de comissões no fluxo de caixa do mês
   */
  static async calculateCashFlowImpact(companyId: string, year: number, month: number) {
    const payments = await prisma.commissionPayment.findMany({
      where: {
        companyId,
        referenceYear: year,
        referenceMonth: month,
      },
    })

    const pendingCommissions = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.totalCommission), 0)

    const approvedCommissions = payments
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + Number(p.approvedCommission), 0)

    const paidCommissions = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.paidAmount), 0)

    return {
      pendingImpact: pendingCommissions,
      approvedImpact: approvedCommissions,
      totalPaidOut: paidCommissions,
      netCashFlowImpact: pendingCommissions + approvedCommissions + paidCommissions,
    }
  }

  /**
   * Relatório de comissões pagasneste mês para reconciliação
   */
  static async getPaymentReconciliation(companyId: string, year: number, month: number) {
    const payments = await prisma.commissionPayment.findMany({
      where: {
        companyId,
        referenceYear: year,
        referenceMonth: month,
        status: 'PAID',
      },
      include: {
        employee: true,
        histories: {
          where: { eventType: 'PAID' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const reconciliation = {
      month,
      year,
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.paidAmount), 0),
      paymentsByMethod: {} as Record<string, { count: number; amount: number }>,
      paymentsByEmployee: payments.map((p) => ({
        employeeId: p.employeeId,
        employeeName: p.employee.name,
        amount: Number(p.paidAmount),
        paidVia: p.paidVia,
        paidAt: p.paidAt,
        reference: p.paymentReference,
      })),
    }

    // Agrupar por método de pagamento
    payments.forEach((p) => {
      const method = p.paidVia || 'UNKNOWN'
      if (!reconciliation.paymentsByMethod[method]) {
        reconciliation.paymentsByMethod[method] = { count: 0, amount: 0 }
      }
      reconciliation.paymentsByMethod[method].count += 1
      reconciliation.paymentsByMethod[method].amount += Number(p.paidAmount)
    })

    return reconciliation
  }

  /**
   * Buscar transações de comissão no período
   */
  static async getCommissionTransactions(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    return prisma.transaction.findMany({
      where: {
        companyId,
        category: 'COMMISSION',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: 'desc' },
    })
  }
}
