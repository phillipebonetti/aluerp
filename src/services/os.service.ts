import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export interface ServiceOrderWithDetails {
  id: string
  number: string
  projectId: string
  status: string
  scheduledDate?: Date
  startDate?: Date
  endDate?: Date
  description?: string
  notes?: string
  createdAt: Date
  project?: any
}

export class OSService {
  /**
   * Recupera todas as OS da empresa
   */
  async getAll(options: RepositoryOptions): Promise<ServiceOrderWithDetails[]> {
    const orders = await prisma.serviceOrder.findMany({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map(o => ({
      id: o.id,
      number: o.number,
      projectId: o.projectId,
      status: o.status,
      scheduledDate: o.scheduledDate || undefined,
      startDate: o.startDate || undefined,
      endDate: o.endDate || undefined,
      description: o.description || undefined,
      notes: o.notes || undefined,
      createdAt: o.createdAt,
      project: o.project,
    }))
  }

  /**
   * Recupera uma OS por ID
   */
  async getById(id: string, options: RepositoryOptions): Promise<ServiceOrderWithDetails | null> {
    const order = await prisma.serviceOrder.findFirst({
      where: {
        id,
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        project: {
          include: {
            client: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!order) return null

    return {
      id: order.id,
      number: order.number,
      projectId: order.projectId,
      status: order.status,
      scheduledDate: order.scheduledDate || undefined,
      startDate: order.startDate || undefined,
      endDate: order.endDate || undefined,
      description: order.description || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      project: order.project,
    }
  }

  /**
   * Cria uma nova OS
   */
  async create(
    data: {
      projectId: string
      number: string
      scheduledDate?: Date
      description?: string
      notes?: string
    },
    options: RepositoryOptions,
  ): Promise<ServiceOrderWithDetails> {
    const order = await prisma.serviceOrder.create({
      data: {
        ...data,
        companyId: options.companyId,
        status: 'DRAFT',
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
    })

    return {
      id: order.id,
      number: order.number,
      projectId: order.projectId,
      status: order.status,
      scheduledDate: order.scheduledDate || undefined,
      startDate: order.startDate || undefined,
      endDate: order.endDate || undefined,
      description: order.description || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      project: order.project,
    }
  }

  /**
   * Atualiza uma OS
   */
  async update(
    id: string,
    data: {
      number?: string
      status?: string
      scheduledDate?: Date
      startDate?: Date
      endDate?: Date
      description?: string
      notes?: string
    },
    options: RepositoryOptions,
  ): Promise<ServiceOrderWithDetails | null> {
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
    })

    return {
      id: order.id,
      number: order.number,
      projectId: order.projectId,
      status: order.status,
      scheduledDate: order.scheduledDate || undefined,
      startDate: order.startDate || undefined,
      endDate: order.endDate || undefined,
      description: order.description || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt,
      project: order.project,
    }
  }

  /**
   * Deleta uma OS (soft delete)
   */
  async delete(id: string, options: RepositoryOptions): Promise<boolean> {
    try {
      await prisma.serviceOrder.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Inicia uma OS
   */
  async start(id: string, options: RepositoryOptions): Promise<ServiceOrderWithDetails | null> {
    return this.update(id, { status: 'IN_PROGRESS', startDate: new Date() }, options)
  }

  /**
   * Conclui uma OS
   */
  async complete(id: string, options: RepositoryOptions): Promise<ServiceOrderWithDetails | null> {
    return this.update(id, { status: 'COMPLETED', endDate: new Date() }, options)
  }

  /**
   * Cancela uma OS
   */
  async cancel(id: string, options: RepositoryOptions): Promise<ServiceOrderWithDetails | null> {
    return this.update(id, { status: 'CANCELLED' }, options)
  }

  /**
   * Lista OS por projeto
   */
  async getByProject(projectId: string, options: RepositoryOptions): Promise<ServiceOrderWithDetails[]> {
    const orders = await prisma.serviceOrder.findMany({
      where: {
        projectId,
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map(o => ({
      id: o.id,
      number: o.number,
      projectId: o.projectId,
      status: o.status,
      scheduledDate: o.scheduledDate || undefined,
      startDate: o.startDate || undefined,
      endDate: o.endDate || undefined,
      description: o.description || undefined,
      notes: o.notes || undefined,
      createdAt: o.createdAt,
      project: o.project,
    }))
  }

  /**
   * Lista OS abertas
   */
  async getOpen(options: RepositoryOptions): Promise<ServiceOrderWithDetails[]> {
    const orders = await prisma.serviceOrder.findMany({
      where: {
        companyId: options.companyId,
        status: { in: ['DRAFT', 'IN_PROGRESS'] },
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map(o => ({
      id: o.id,
      number: o.number,
      projectId: o.projectId,
      status: o.status,
      scheduledDate: o.scheduledDate || undefined,
      startDate: o.startDate || undefined,
      endDate: o.endDate || undefined,
      description: o.description || undefined,
      notes: o.notes || undefined,
      createdAt: o.createdAt,
      project: o.project,
    }))
  }

  /**
   * Conta OS por status
   */
  async countByStatus(options: RepositoryOptions): Promise<Record<string, number>> {
    const statuses = await prisma.serviceOrder.groupBy({
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

  /**
   * Gera próximo número de OS
   */
  async getNextNumber(options: RepositoryOptions): Promise<string> {
    const lastOS = await prisma.serviceOrder.findFirst({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    const lastNumber = lastOS ? parseInt(lastOS.number.replace(/\D/g, '')) : 0
    const nextNumber = String(lastNumber + 1).padStart(6, '0')
    return `OS-${nextNumber}`
  }
}
