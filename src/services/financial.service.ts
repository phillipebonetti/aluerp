import { TransactionRepository, RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export interface FinancialMetrics {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
  overduePendingCount: number
  overduePendingAmount: number
}

export interface CashFlowData {
  date: Date
  income: number
  expense: number
  balance: number
}

export class FinancialService {
  private transactionRepo: TransactionRepository

  constructor() {
    this.transactionRepo = new TransactionRepository()
  }

  /**
   * Calcula métricas financeiras gerais
   */
  async calculateMetrics(options: RepositoryOptions): Promise<FinancialMetrics> {
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Total (todos os tempos, pagos)
    const totalBalance = await this.transactionRepo.calculateBalance(options)

    // Mês atual (pagos)
    const monthBalance = await this.transactionRepo.calculateBalance(options, currentMonth, nextMonth)

    // Contar vencidos
    const overdue = await this.transactionRepo.findOverdue(options)
    const overduePendingAmount = overdue.reduce(
      (sum, tx) => sum + parseFloat(tx.amount.toString()),
      0,
    )

    return {
      totalIncome: totalBalance.income,
      totalExpense: totalBalance.expense,
      balance: totalBalance.balance,
      monthlyIncome: monthBalance.income,
      monthlyExpense: monthBalance.expense,
      monthlyBalance: monthBalance.balance,
      overduePendingCount: overdue.length,
      overduePendingAmount,
    }
  }

  /**
   * Calcula KPIs do dashboard
   */
  async getDashboardKPIs(options: RepositoryOptions): Promise<{
    saldoAtual: number
    entradasMes: number
    saidasMes: number
    lucroMes: number
    osAbertas: number
    obrasAtivas: number
    clientesAtivos: number
    vencidosPending: number
  }> {
    const metrics = await this.calculateMetrics(options)

    const [osCount, projectCount, clientCount] = await Promise.all([
      prisma.serviceOrder.count({
        where: {
          companyId: options.companyId,
          status: { not: 'COMPLETED' },
          deletedAt: null,
        },
      }),
      prisma.project.count({
        where: {
          companyId: options.companyId,
          status: { not: 'COMPLETED' },
          deletedAt: null,
        },
      }),
      prisma.client.count({
        where: {
          companyId: options.companyId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      }),
    ])

    // Saldo atual = saldo em banco
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
      },
    })

    const saldoAtual = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0)

    return {
      saldoAtual,
      entradasMes: metrics.monthlyIncome,
      saidasMes: metrics.monthlyExpense,
      lucroMes: metrics.monthlyBalance,
      osAbertas: osCount,
      obrasAtivas: projectCount,
      clientesAtivos: clientCount,
      vencidosPending: metrics.overduePendingCount,
    }
  }

  /**
   * Calcula comissão de vendedor
   */
  async calculateCommission(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    options: RepositoryOptions,
  ): Promise<number> {
    const quotes = await prisma.quote.findMany({
      where: {
        companyId: options.companyId,
        salespersonId: employeeId,
        approvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: options.companyId,
      },
    })

    if (!employee) return 0

    const totalQuotedValue = quotes.reduce(
      (sum, quote) => sum + parseFloat(quote.totalValue.toString()),
      0,
    )

    const commissionRate = parseFloat(employee.commissionRate.toString()) / 100

    return totalQuotedValue * commissionRate
  }

  /**
   * Calcula lucro por projeto
   */
  async calculateProjectProfit(
    projectId: string,
    options: RepositoryOptions,
  ): Promise<{
    revenue: number
    costs: number
    profit: number
    margin: number
  }> {
    // Receita do projeto (transações de INCOME)
    const revenues = await prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        projectId,
        type: 'INCOME',
        status: 'PAID',
        deletedAt: null,
      },
    })

    // Custos do projeto (transações de EXPENSE + project costs)
    const expenses = await prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        projectId,
        type: 'EXPENSE',
        status: 'PAID',
        deletedAt: null,
      },
    })

    const projectCosts = await prisma.projectCost.findMany({
      where: { projectId },
    })

    const revenue = revenues.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    const txExpense = expenses.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    const projectCostTotal = projectCosts.reduce((sum, pc) => sum + parseFloat(pc.amount.toString()), 0)

    const costs = txExpense + projectCostTotal
    const profit = revenue - costs
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    return { revenue, costs, profit, margin }
  }

  /**
   * Valida se banco tem saldo para saída
   */
  async validateBankBalance(
    bankAccountId: string,
    amount: number,
    options: RepositoryOptions,
  ): Promise<{
    valid: boolean
    currentBalance: number
    difference: number
  }> {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        companyId: options.companyId,
      },
    })

    if (!bankAccount) {
      return { valid: false, currentBalance: 0, difference: 0 }
    }

    const currentBalance = parseFloat(bankAccount.balance.toString())
    const difference = currentBalance - amount

    return {
      valid: difference >= 0,
      currentBalance,
      difference,
    }
  }

  /**
   * Recupera transações com filtros
   */
  async getTransactions(
    options: RepositoryOptions,
    filters?: {
      type?: 'INCOME' | 'EXPENSE'
      status?: string
      startDate?: Date
      endDate?: Date
      clientId?: string
      supplierId?: string
    },
  ): Promise<any[]> {
    const where: any = {
      companyId: options.companyId,
      deletedAt: null,
    }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.supplierId) where.supplierId = filters.supplierId

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {}
      if (filters.startDate) where.dueDate.gte = filters.startDate
      if (filters.endDate) where.dueDate.lte = filters.endDate
    }

    return prisma.transaction.findMany({
      where,
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'desc' },
    })
  }
}
