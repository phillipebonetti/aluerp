import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export interface BudgetWithDetails {
  id: string
  number: string
  clientId: string
  projectId?: string
  status: string
  totalValue: number
  validUntil?: Date
  createdAt: Date
  client?: any
  project?: any
  items?: any[]
}

export class BudgetService {
  /**
   * Recupera todos os orçamentos da empresa
   */
  async getAll(options: RepositoryOptions): Promise<BudgetWithDetails[]> {
    const budgets = await prisma.quote.findMany({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return budgets.map(b => ({
      id: b.id,
      number: b.number,
      clientId: b.clientId,
      projectId: b.projectId || undefined,
      status: b.status,
      totalValue: parseFloat(b.totalValue.toString()),
      validUntil: b.validUntil || undefined,
      createdAt: b.createdAt,
      client: b.client,
      project: b.project,
      items: b.items,
    }))
  }

  /**
   * Recupera um orçamento por ID
   */
  async getById(id: string, options: RepositoryOptions): Promise<BudgetWithDetails | null> {
    const budget = await prisma.quote.findFirst({
      where: {
        id,
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        client: true,
        project: true,
        items: true,
        versions: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!budget) return null

    return {
      id: budget.id,
      number: budget.number,
      clientId: budget.clientId,
      projectId: budget.projectId || undefined,
      status: budget.status,
      totalValue: parseFloat(budget.totalValue.toString()),
      validUntil: budget.validUntil || undefined,
      createdAt: budget.createdAt,
      client: budget.client,
      project: budget.project,
      items: budget.items,
    }
  }

  /**
   * Cria um novo orçamento
   */
  async create(
    data: {
      clientId: string
      projectId?: string
      number: string
      totalValue: number
      salespersonId?: string
      validUntil?: Date
      notes?: string
    },
    options: RepositoryOptions,
  ): Promise<BudgetWithDetails> {
    const budget = await prisma.quote.create({
      data: {
        ...data,
        companyId: options.companyId,
        status: 'DRAFT',
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    })

    return {
      id: budget.id,
      number: budget.number,
      clientId: budget.clientId,
      projectId: budget.projectId || undefined,
      status: budget.status,
      totalValue: parseFloat(budget.totalValue.toString()),
      validUntil: budget.validUntil || undefined,
      createdAt: budget.createdAt,
      client: budget.client,
      project: budget.project,
      items: budget.items,
    }
  }

  /**
   * Atualiza um orçamento
   */
  async update(
    id: string,
    data: {
      number?: string
      totalValue?: number
      status?: string
      validUntil?: Date
      notes?: string
    },
    options: RepositoryOptions,
  ): Promise<BudgetWithDetails | null> {
    const budget = await prisma.quote.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    })

    return {
      id: budget.id,
      number: budget.number,
      clientId: budget.clientId,
      projectId: budget.projectId || undefined,
      status: budget.status,
      totalValue: parseFloat(budget.totalValue.toString()),
      validUntil: budget.validUntil || undefined,
      createdAt: budget.createdAt,
      client: budget.client,
      project: budget.project,
      items: budget.items,
    }
  }

  /**
   * Deleta um orçamento (soft delete)
   */
  async delete(id: string, options: RepositoryOptions): Promise<boolean> {
    try {
      await prisma.quote.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Aprova um orçamento
   */
  async approve(id: string, options: RepositoryOptions): Promise<BudgetWithDetails | null> {
    return this.update(id, { status: 'APPROVED', ...{ approvedAt: new Date() } }, options)
  }

  /**
   * Rejeita um orçamento
   */
  async reject(id: string, options: RepositoryOptions): Promise<BudgetWithDetails | null> {
    return this.update(id, { status: 'REJECTED', ...{ rejectedAt: new Date() } }, options)
  }

  /**
   * Envia um orçamento para o cliente
   */
  async send(id: string, options: RepositoryOptions): Promise<BudgetWithDetails | null> {
    return this.update(id, { status: 'SENT', ...{ sentAt: new Date() } }, options)
  }

  /**
   * Lista orçamentos por cliente
   */
  async getByClient(clientId: string, options: RepositoryOptions): Promise<BudgetWithDetails[]> {
    const budgets = await prisma.quote.findMany({
      where: {
        clientId,
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return budgets.map(b => ({
      id: b.id,
      number: b.number,
      clientId: b.clientId,
      projectId: b.projectId || undefined,
      status: b.status,
      totalValue: parseFloat(b.totalValue.toString()),
      validUntil: b.validUntil || undefined,
      createdAt: b.createdAt,
      client: b.client,
      project: b.project,
      items: b.items,
    }))
  }

  /**
   * Conta orçamentos por status
   */
  async countByStatus(options: RepositoryOptions): Promise<Record<string, number>> {
    const statuses = await prisma.quote.groupBy({
      by: ['status'],
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      _count: { id: true },
    })

    const result: Record<string, number> = {}
    statuses.forEach(s => {
      result[s.status] = s._count.id
    })
    return result
  }
}
