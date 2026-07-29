import { ClientRepository, RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class ClientService {
  private clientRepo: ClientRepository

  constructor() {
    this.clientRepo = new ClientRepository()
  }

  /**
   * Recupera clientes com análise de faturamento
   */
  async getClientsWithAnalysis(options: RepositoryOptions): Promise<any[]> {
    const clients = await this.clientRepo.findAll(options)

    return Promise.all(
      clients.map(async (client: any) => {
        const totalRevenue = await this.calculateClientTotalRevenue(client.id, options)
        const totalProjects = await prisma.project.count({
          where: {
            clientId: client.id,
            companyId: options.companyId,
            deletedAt: null,
          },
        })

        return {
          ...client,
          totalRevenue,
          totalProjects,
        }
      }),
    )
  }

  /**
   * Calcula receita total de um cliente
   */
  async calculateClientTotalRevenue(clientId: string, options: RepositoryOptions): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        clientId,
        type: 'INCOME',
        status: 'PAID',
        deletedAt: null,
      },
    })

    return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
  }

  /**
   * Recupera clientes ativos com contagem
   */
  async getActiveClientsCount(options: RepositoryOptions): Promise<number> {
    return this.clientRepo.countActive(options)
  }

  /**
   * Obtém histórico de transações de cliente
   */
  async getClientTransactionHistory(
    clientId: string,
    options: RepositoryOptions,
  ): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        clientId,
        deletedAt: null,
      },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'desc' },
    })
  }

  /**
   * Calcula crédito/débito de cliente
   */
  async calculateClientBalance(clientId: string, options: RepositoryOptions): Promise<{
    totalInvoiced: number
    totalPaid: number
    totalPending: number
  }> {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        clientId,
        deletedAt: null,
      },
    })

    const totalInvoiced = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)

    const totalPaid = transactions
      .filter(tx => tx.type === 'INCOME' && tx.status === 'PAID')
      .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)

    const totalPending = transactions
      .filter(tx => tx.type === 'INCOME' && tx.status !== 'PAID')
      .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)

    return { totalInvoiced, totalPaid, totalPending }
  }
}
