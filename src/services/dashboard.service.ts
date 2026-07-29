import { FinancialService } from './financial.service'
import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export interface DashboardData {
  kpis: any
  recentOrders: any[]
  recentTransactions: any[]
  topClients: any[]
  overduePendingTransactions: any[]
  cashFlow: any
  monthlyComparison: any
  alerts: any[]
  topSellers: any[]
  projectMetrics: any
  financialIndicators: any
}

export class DashboardService {
  private financialService: FinancialService

  constructor() {
    this.financialService = new FinancialService()
  }

  /**
   * Recupera todos os dados do dashboard
   */
  async getDashboardData(options: RepositoryOptions): Promise<DashboardData> {
    const [kpis, recentOrders, recentTransactions, topClients, overduePending, cashFlow, monthlyComparison, alerts, topSellers, projectMetrics, financialIndicators] = await Promise.all([
      this.financialService.getDashboardKPIs(options),
      this.getRecentServiceOrders(options),
      this.getRecentTransactions(options),
      this.getTopClients(options),
      this.getOverduePendingTransactions(options),
      this.getCashFlowAnalysis(options),
      this.getMonthlyComparison(options),
      this.getAlerts(options),
      this.getTopSellers(options),
      this.getProjectMetrics(options),
      this.getFinancialIndicators(options),
    ])

    return {
      kpis,
      recentOrders,
      recentTransactions,
      topClients,
      overduePendingTransactions: overduePending,
      cashFlow,
      monthlyComparison,
      alerts,
      topSellers,
      projectMetrics,
      financialIndicators,
    }
  }

  /**
   * Recupera ordens de serviço recentes
   */
  private async getRecentServiceOrders(options: RepositoryOptions, limit: number = 10): Promise<any[]> {
    return prisma.serviceOrder.findMany({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        project: {
          include: { client: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Recupera transações recentes
   */
  private async getRecentTransactions(options: RepositoryOptions, limit: number = 5): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Recupera top clientes
   */
  private async getTopClients(options: RepositoryOptions, limit: number = 5): Promise<any[]> {
    const transactions = await prisma.transaction.groupBy({
      by: ['clientId'],
      where: {
        companyId: options.companyId,
        type: 'INCOME',
        status: 'PAID',
        deletedAt: null,
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    })

    const clients = await prisma.client.findMany({
      where: {
        id: { in: transactions.map(t => t.clientId).filter(Boolean) as string[] },
      },
    })

    return transactions.map(tx => ({
      clientId: tx.clientId,
      totalRevenue: tx._sum.amount,
      client: clients.find(c => c.id === tx.clientId),
    }))
  }

  /**
   * Recupera transações vencidas e pendentes
   */
  private async getOverduePendingTransactions(options: RepositoryOptions): Promise<any[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        status: 'PENDING',
        dueDate: { lt: today },
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })
  }

  /**
   * Análise de fluxo de caixa (últimos 12 meses)
   */
  async getCashFlowAnalysis(options: RepositoryOptions): Promise<any> {
    const months = 12
    const today = new Date()
    const data = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)

      const income = await prisma.transaction.aggregate({
        where: {
          companyId: options.companyId,
          type: 'INCOME',
          status: 'PAID',
          createdAt: { gte: monthStart, lte: monthEnd },
          deletedAt: null,
        },
        _sum: { amount: true },
      })

      const expense = await prisma.transaction.aggregate({
        where: {
          companyId: options.companyId,
          type: 'EXPENSE',
          status: 'PAID',
          createdAt: { gte: monthStart, lte: monthEnd },
          deletedAt: null,
        },
        _sum: { amount: true },
      })

      data.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        net: (income._sum.amount || 0) - (expense._sum.amount || 0),
      })
    }

    return data
  }

  /**
   * Comparativo mês atual vs anterior
   */
  async getMonthlyComparison(options: RepositoryOptions): Promise<any> {
    const today = new Date()
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const currentIncome = await prisma.transaction.aggregate({
      where: {
        companyId: options.companyId,
        type: 'INCOME',
        status: 'PAID',
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
        deletedAt: null,
      },
      _sum: { amount: true },
    })

    const lastIncome = await prisma.transaction.aggregate({
      where: {
        companyId: options.companyId,
        type: 'INCOME',
        status: 'PAID',
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        deletedAt: null,
      },
      _sum: { amount: true },
    })

    const currentValue = currentIncome._sum.amount || 0
    const lastValue = lastIncome._sum.amount || 0
    const variation = lastValue > 0 ? ((currentValue - lastValue) / lastValue) * 100 : 0

    return {
      currentMonth: currentValue,
      lastMonth: lastValue,
      variation: parseFloat(variation.toFixed(2)),
      status: variation > 0 ? 'positive' : variation < 0 ? 'negative' : 'neutral',
    }
  }

  /**
   * Sistema de alertas
   */
  async getAlerts(options: RepositoryOptions): Promise<any[]> {
    const alerts = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Alerta: Transações vencidas
    const overdue = await prisma.transaction.count({
      where: {
        companyId: options.companyId,
        status: 'PENDING',
        dueDate: { lt: today },
        deletedAt: null,
      },
    })

    if (overdue > 0) {
      alerts.push({
        type: 'warning',
        title: 'Transações Vencidas',
        message: `Você tem ${overdue} transação(ões) vencida(s)`,
        action: '/financeiro',
      })
    }

    // Alerta: OS abertas
    const openOS = await prisma.serviceOrder.count({
      where: {
        companyId: options.companyId,
        status: 'OPEN',
        deletedAt: null,
      },
    })

    if (openOS > 0) {
      alerts.push({
        type: 'info',
        title: 'Ordens de Serviço Abertas',
        message: `${openOS} OS(s) aguardando ação`,
        action: '/os',
      })
    }

    // Alerta: Projetos próximos do término
    const nearDeadline = await prisma.project.count({
      where: {
        companyId: options.companyId,
        endDate: {
          gte: today,
          lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
        deletedAt: null,
      },
    })

    if (nearDeadline > 0) {
      alerts.push({
        type: 'alert',
        title: 'Projetos Próximos do Término',
        message: `${nearDeadline} projeto(s) termina(m) nos próximos 7 dias`,
        action: '/obras',
      })
    }

    return alerts
  }

  /**
   * Ranking de vendedores (por receita)
   */
  async getTopSellers(options: RepositoryOptions, limit: number = 5): Promise<any[]> {
    const sellers = await prisma.employee.findMany({
      where: {
        companyId: options.companyId,
        role: 'SELLER',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
      take: limit,
    })

    const sellersWithMetrics = await Promise.all(
      sellers.map(async (seller) => {
        const totalRevenue = await prisma.transaction.aggregate({
          where: {
            companyId: options.companyId,
            type: 'INCOME',
            status: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
            deletedAt: null,
          },
          _sum: { amount: true },
        })

        return {
          id: seller.id,
          name: seller.name,
          revenue: totalRevenue._sum.amount || 0,
          percentage: 0, // Será calculado após agregar
        }
      })
    )

    const totalRevenue = sellersWithMetrics.reduce((sum, s) => sum + s.revenue, 0)
    return sellersWithMetrics
      .map((s) => ({
        ...s,
        percentage: totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  /**
   * Métricas de projetos (abertos, em progresso, concluídos)
   */
  async getProjectMetrics(options: RepositoryOptions): Promise<any> {
    const total = await prisma.project.count({
      where: { companyId: options.companyId, deletedAt: null },
    })

    const active = await prisma.project.count({
      where: {
        companyId: options.companyId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    })

    const completed = await prisma.project.count({
      where: {
        companyId: options.companyId,
        status: 'COMPLETED',
        deletedAt: null,
      },
    })

    return {
      total,
      active,
      completed,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
    }
  }

  /**
   * Indicadores financeiros (margem, ROI, etc)
   */
  async getFinancialIndicators(options: RepositoryOptions): Promise<any> {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const income = await prisma.transaction.aggregate({
      where: {
        companyId: options.companyId,
        type: 'INCOME',
        status: 'PAID',
        createdAt: { gte: monthStart, lte: monthEnd },
        deletedAt: null,
      },
      _sum: { amount: true },
    })

    const expense = await prisma.transaction.aggregate({
      where: {
        companyId: options.companyId,
        type: 'EXPENSE',
        status: 'PAID',
        createdAt: { gte: monthStart, lte: monthEnd },
        deletedAt: null,
      },
      _sum: { amount: true },
    })

    const totalIncome = income._sum.amount || 0
    const totalExpense = expense._sum.amount || 0
    const profit = totalIncome - totalExpense
    const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0

    return {
      totalIncome,
      totalExpense,
      profit,
      margin: parseFloat(margin),
      expenseRatio: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(2) : 0,
    }
  }
}
