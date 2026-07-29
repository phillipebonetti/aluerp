import { EmployeeRepository, RepositoryOptions } from '@/repositories'
import { FinancialService } from './financial.service'
import { prisma } from '@/src/core/database'

export class EmployeeService {
  private employeeRepo: EmployeeRepository
  private financialService: FinancialService

  constructor() {
    this.employeeRepo = new EmployeeRepository()
    this.financialService = new FinancialService()
  }

  async getActiveEmployees(options: RepositoryOptions): Promise<any[]> {
    return this.employeeRepo.findActive(options)
  }

  async getSalespeople(options: RepositoryOptions): Promise<any[]> {
    return this.employeeRepo.findBySalesperson(options)
  }

  async countActiveEmployees(options: RepositoryOptions): Promise<number> {
    return this.employeeRepo.countActive(options)
  }

  async calculateEmployeeCommission(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    options: RepositoryOptions,
  ): Promise<number> {
    return this.financialService.calculateCommission(employeeId, startDate, endDate, options)
  }

  async getEmployeeSales(employeeId: string, options: RepositoryOptions): Promise<any[]> {
    return prisma.quote.findMany({
      where: {
        companyId: options.companyId,
        salespersonId: employeeId,
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getEmployeePerformance(
    employeeId: string,
    options: RepositoryOptions,
  ): Promise<{
    totalQuotes: number
    approvedQuotes: number
    rejectedQuotes: number
    totalValue: number
    approvalRate: number
  }> {
    const quotes = await prisma.quote.findMany({
      where: {
        companyId: options.companyId,
        salespersonId: employeeId,
      },
    })

    const totalQuotes = quotes.length
    const approvedQuotes = quotes.filter(q => q.approvedAt).length
    const rejectedQuotes = quotes.filter(q => q.rejectedAt).length
    const totalValue = quotes.reduce((sum, q) => sum + parseFloat(q.totalValue.toString()), 0)
    const approvalRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0

    return {
      totalQuotes,
      approvedQuotes,
      rejectedQuotes,
      totalValue,
      approvalRate,
    }
  }
}
