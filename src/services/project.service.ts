import { ProjectRepository, RepositoryOptions } from '@/repositories'
import { FinancialService } from './financial.service'
import { prisma } from '@/src/core/database'

export class ProjectService {
  private projectRepo: ProjectRepository
  private financialService: FinancialService

  constructor() {
    this.projectRepo = new ProjectRepository()
    this.financialService = new FinancialService()
  }

  /**
   * Recupera projetos ativos com análise financeira
   */
  async getActiveProjectsWithAnalysis(
    options: RepositoryOptions,
  ): Promise<
    Array<{
      id: string
      name: string
      client: any
      status: string
      profit: number
      margin: number
      budget: number
      spent: number
    }>
  > {
    const activeProjects = await this.projectRepo.findActive(options)

    const withAnalysis = await Promise.all(
      activeProjects.map(async (project: any) => {
        const profit = await this.financialService.calculateProjectProfit(project.id, options)
        const totalCosts = await this.projectRepo.calculateTotalCosts(project.id, options)

        return {
          id: project.id,
          name: project.name,
          client: project.client,
          status: project.status,
          profit: profit.profit,
          margin: profit.margin,
          budget: parseFloat(project.totalValue?.toString() || '0'),
          spent: totalCosts,
        }
      }),
    )

    return withAnalysis
  }

  /**
   * Calcula status financeiro do projeto
   */
  async getProjectFinancialStatus(projectId: string, options: RepositoryOptions): Promise<any> {
    const project = await this.projectRepo.findByIdWithRelations(projectId, options)

    if (!project) {
      return null
    }

    const profit = await this.financialService.calculateProjectProfit(projectId, options)
    const totalCosts = await this.projectRepo.calculateTotalCosts(projectId, options)
    const expenses = await prisma.transaction.findMany({
      where: {
        projectId,
        type: 'EXPENSE',
        deletedAt: null,
      },
    })

    const budget = parseFloat(project.totalValue?.toString() || '0')
    const budgetUsed = (totalCosts / budget) * 100

    return {
      ...project,
      financial: {
        ...profit,
        totalCosts,
        budgetRemaining: budget - totalCosts,
        budgetUsedPercentage: budgetUsed,
        expenses: expenses.length,
      },
    }
  }

  /**
   * Lista projetos por status
   */
  async getProjectsByStatus(status: string, options: RepositoryOptions): Promise<any[]> {
    return this.projectRepo.findByStatus(status, options)
  }

  /**
   * Conta projetos ativos
   */
  async countActiveProjects(options: RepositoryOptions): Promise<number> {
    return this.projectRepo.countActive(options)
  }

  /**
   * Marca projeto como concluído
   */
  async completeProject(projectId: string, options: RepositoryOptions): Promise<boolean> {
    await prisma.project.update({
      where: {
        id: projectId,
        companyId: options.companyId,
      },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
    })
    return true
  }
}
