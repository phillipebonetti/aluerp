import { BaseRepository, RepositoryOptions } from './base.repository'
import { prisma } from '@/src/core/database'

export interface ProjectWithRelations {
  id: string
  companyId: string
  clientId: string
  name: string
  status: string
  startDate?: Date | null
  endDate?: Date | null
  totalValue?: number | null
  costEstimated?: number | null
  [key: string]: any
}

export class ProjectRepository extends BaseRepository<ProjectWithRelations> {
  protected entityName = 'project' as const

  async findActive(options: RepositoryOptions): Promise<ProjectWithRelations[]> {
    return prisma.project.findMany({
      where: {
        companyId: options.companyId,
        status: { not: 'COMPLETED' },
        deletedAt: null,
      },
      include: { client: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    }) as Promise<ProjectWithRelations[]>
  }

  async findByStatus(
    status: string,
    options: RepositoryOptions,
  ): Promise<ProjectWithRelations[]> {
    return prisma.project.findMany({
      where: {
        companyId: options.companyId,
        status,
        deletedAt: null,
      },
      include: { client: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    }) as Promise<ProjectWithRelations[]>
  }

  async countActive(options: RepositoryOptions): Promise<number> {
    return prisma.project.count({
      where: {
        companyId: options.companyId,
        status: { not: 'COMPLETED' },
        deletedAt: null,
      },
    })
  }

  async calculateTotalCosts(id: string, options: RepositoryOptions): Promise<number> {
    const costs = await prisma.projectCost.findMany({
      where: {
        projectId: id,
        project: { companyId: options.companyId },
      },
    })
    return costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0)
  }
}
