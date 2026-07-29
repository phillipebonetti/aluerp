import { FinancialService } from './financial.service'
import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export interface DashboardData {
  kpis: any
  recentOrders: any[]
  recentTransactions: any[]
  topClients: any[]
  overduePendingTransactions: any[]
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
    const [kpis, recentOrders, recentTransactions, topClients, overduePending] = await Promise.all([
      this.financialService.getDashboardKPIs(options),
      this.getRecentServiceOrders(options),
      this.getRecentTransactions(options),
      this.getTopClients(options),
      this.getOverduePendingTransactions(options),
    ])

    return {
      kpis,
      recentOrders,
      recentTransactions,
      topClients,
      overduePendingTransactions: overduePending,
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
}
