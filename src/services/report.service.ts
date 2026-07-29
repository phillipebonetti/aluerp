import { FinancialService } from './financial.service'
import { ProjectService } from './project.service'
import { ClientService } from './client.service'
import { EmployeeService } from './employee.service'
import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class ReportService {
  private financialService: FinancialService
  private projectService: ProjectService
  private clientService: ClientService
  private employeeService: EmployeeService

  constructor() {
    this.financialService = new FinancialService()
    this.projectService = new ProjectService()
    this.clientService = new ClientService()
    this.employeeService = new EmployeeService()
  }

  /**
   * Relatório mensal de financeiro
   */
  async getMonthlyFinancialReport(
    year: number,
    month: number,
    options: RepositoryOptions,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const metrics = await this.financialService.calculateMetrics(options)

    const transactions = await this.financialService.getTransactions(options, {
      startDate,
      endDate,
    })

    const byCategory: any = {}
    transactions.forEach((tx: any) => {
      const key = tx.type === 'INCOME' ? tx.incomeCategoryId : tx.expenseCategoryId
      if (!byCategory[key]) byCategory[key] = 0
      byCategory[key] += parseFloat(tx.amount.toString())
    })

    return {
      period: `${month}/${year}`,
      metrics,
      transactions: transactions.length,
      byCategory,
    }
  }

  /**
   * Relatório de projetos
   */
  async getProjectReport(options: RepositoryOptions): Promise<any> {
    const activeProjects = await this.projectService.getActiveProjectsWithAnalysis(options)

    const totalValue = activeProjects.reduce((sum, p) => sum + p.budget, 0)
    const totalProfit = activeProjects.reduce((sum, p) => sum + p.profit, 0)
    const averageMargin = activeProjects.length > 0 ? totalProfit / totalValue : 0

    return {
      totalProjects: activeProjects.length,
      totalValue,
      totalProfit,
      averageMargin: `${(averageMargin * 100).toFixed(2)}%`,
      projects: activeProjects,
    }
  }

  /**
   * Relatório de clientes
   */
  async getClientReport(options: RepositoryOptions): Promise<any> {
    const clients = await this.clientService.getClientsWithAnalysis(options)

    const totalClients = clients.length
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)
    const averageRevenue = totalClients > 0 ? totalRevenue / totalClients : 0

    const topClients = clients.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)

    return {
      totalClients,
      totalRevenue,
      averageRevenue,
      topClients,
    }
  }

  /**
   * Relatório de vendedores
   */
  async getSalesReport(options: RepositoryOptions): Promise<any> {
    const employees = await this.employeeService.getSalespeople(options)

    const salesData = await Promise.all(
      employees.map(async (emp: any) => {
        const performance = await this.employeeService.getEmployeePerformance(emp.id, options)
        return {
          ...emp,
          ...performance,
        }
      }),
    )

    return {
      totalSalespeople: employees.length,
      salespeople: salesData,
    }
  }

  /**
   * Relatório de vencimentos
   */
  async getOverdueReport(options: RepositoryOptions): Promise<any> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdue = await prisma.transaction.findMany({
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
    })

    const totalAmount = overdue.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    const byDaysOverdue: any = {}

    overdue.forEach((tx: any) => {
      const daysOverdue = Math.floor((today.getTime() - tx.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const range = `${daysOverdue}-${daysOverdue + 30}`
      if (!byDaysOverdue[range]) byDaysOverdue[range] = []
      byDaysOverdue[range].push(tx)
    })

    return {
      totalOverdue: overdue.length,
      totalAmount,
      byDaysOverdue,
      transactions: overdue,
    }
  }
}
