import { ClientRepository, RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class ClientService {
  private clientRepo: ClientRepository

  constructor() {
    this.clientRepo = new ClientRepository()
  }

  async list(options: RepositoryOptions & {
    skip?: number
    take?: number
    search?: string
    filters?: { status?: string; category?: string; city?: string }
  }) {
    const where: Record<string, unknown> = {
      companyId: options.companyId,
      deletedAt: null,
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
        { document: { contains: options.search, mode: 'insensitive' } },
      ]
    }
    if (options.filters?.status) where.status = options.filters.status

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: options.skip ?? 0,
        take: options.take ?? 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ])

    return { data, total, skip: options.skip ?? 0, take: options.take ?? 10 }
  }

  async create({ companyId, data }: { companyId: string; data: Record<string, unknown> }) {
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!name) throw new Error('Nome do cliente é obrigatório')

    return prisma.client.create({
      data: {
        companyId,
        name,
        email: typeof data.email === 'string' && data.email.trim() ? data.email.trim() : null,
        phone: typeof data.phone === 'string' && data.phone.trim() ? data.phone.trim() : null,
        document: typeof data.document === 'string' && data.document.trim() ? data.document.trim() : null,
        notes: typeof data.notes === 'string' && data.notes.trim() ? data.notes.trim() : null,
      },
    })
  }

  async update(id: string, companyId: string, data: Record<string, unknown>) {
    const current = await prisma.client.findFirst({ where: { id, companyId, deletedAt: null } })
    if (!current) return null
    return prisma.client.update({
      where: { id },
      data: {
        name: typeof data.name === 'string' ? data.name.trim() : undefined,
        email: typeof data.email === 'string' ? data.email.trim() || null : undefined,
        phone: typeof data.phone === 'string' ? data.phone.trim() || null : undefined,
        document: typeof data.document === 'string' ? data.document.trim() || null : undefined,
        notes: typeof data.notes === 'string' ? data.notes.trim() || null : undefined,
      },
    })
  }

  async remove(id: string, companyId: string) {
    const current = await prisma.client.findFirst({ where: { id, companyId, deletedAt: null } })
    if (!current) return null
    return prisma.client.update({ where: { id }, data: { deletedAt: new Date() } })
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
