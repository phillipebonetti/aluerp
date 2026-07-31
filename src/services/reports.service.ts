import { getPrisma } from '@/src/core/database'

export class ReportsService {
  private prisma = getPrisma()

  // ==================== KPI CALCULATIONS ====================

  async calculateKPIs(companyId: string, startDate: Date, endDate: Date) {
    const [projects, transactions, opportunities, transactions_paid] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          companyId,
          createdAt: { gte: startDate, lte: endDate }
        },
        include: { costs: true }
      }),
      this.prisma.transaction.findMany({
        where: {
          companyId,
          date: { gte: startDate, lte: endDate },
          type: 'INCOME'
        }
      }),
      this.prisma.opportunity.findMany({
        where: {
          companyId,
          status: 'CLOSED_WON',
          closedAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.transaction.findMany({
        where: {
          companyId,
          date: { gte: startDate, lte: endDate }
        }
      })
    ])

    const totalRevenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalCosts = projects.reduce((sum, p) => 
      sum + p.costs.reduce((s, c) => s + Number(c.amount), 0), 0
    )

    const netRevenue = totalRevenue - totalExpenses
    const profit = netRevenue - totalCosts
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalExpenses,
      totalCosts,
      netRevenue,
      profit,
      marginPercentage: margin,
      projectsCount: projects.length,
      projectsInProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      projectsCompleted: projects.filter(p => p.status === 'COMPLETED').length,
      opportunitiesClosed: opportunities.length,
      averageTicket: opportunities.length > 0 ? totalRevenue / opportunities.length : 0,
      receivables: await this.calculateReceivables(companyId),
      payables: await this.calculatePayables(companyId)
    }
  }

  // ==================== FINANCIAL ====================

  async calculateReceivables(companyId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: 'INCOME',
        isPaid: false,
        dueDate: { lte: new Date() }
      }
    })
    return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  }

  async calculatePayables(companyId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: 'EXPENSE',
        isPaid: false,
        dueDate: { lte: new Date() }
      }
    })
    return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  }

  async getCashFlow(companyId: string, months: number = 12) {
    const data = []
    for (let i = months; i >= 0; i--) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - i)
      startDate.setDate(1)
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)

      const income = await this.prisma.transaction.aggregate({
        where: { companyId, type: 'INCOME', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      })

      const expense = await this.prisma.transaction.aggregate({
        where: { companyId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      })

      data.push({
        month: startDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        income: Number(income._sum.amount) || 0,
        expense: Number(expense._sum.amount) || 0,
        balance: (Number(income._sum.amount) || 0) - (Number(expense._sum.amount) || 0)
      })
    }
    return data
  }

  // ==================== COMMERCIAL ====================

  async getCommercialMetrics(companyId: string, startDate: Date, endDate: Date) {
    const [leads, opportunities, quotes] = await Promise.all([
      this.prisma.lead.count({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } }
      }),
      this.prisma.opportunity.count({
        where: { companyId, status: 'CLOSED_WON', closedAt: { gte: startDate, lte: endDate } }
      }),
      this.prisma.quote.count({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } }
      })
    ])

    const conversionRate = leads > 0 ? (opportunities / leads) * 100 : 0

    return {
      leadsGenerated: leads,
      opportunitiesClosed: opportunities,
      quotesIssued: quotes,
      conversionRate
    }
  }

  // ==================== TOP PERFORMERS ====================

  async getTopSellers(companyId: string, limit: number = 10) {
    const sellers = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        responsibleLeads: true,
        responsibleOpportunities: true
      }
    })

    return sellers
      .map(seller => ({
        id: seller.id,
        name: seller.name,
        leadsGenerated: seller.responsibleLeads.length,
        opportunitiesClosed: seller.responsibleOpportunities.filter(o => o.status === 'CLOSED_WON').length,
        totalValue: seller.responsibleOpportunities
          .filter(o => o.status === 'CLOSED_WON')
          .reduce((sum, o) => sum + Number(o.value), 0)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit)
  }

  // ==================== REPORTS ====================

  async getReportSchedules(companyId: string) {
    return this.prisma.reportSchedule.findMany({
      where: { companyId, isActive: true },
      orderBy: { nextScheduled: 'asc' }
    })
  }

  async getDashboardLayout(companyId: string, userId: string) {
    return this.prisma.dashboardLayout.findFirst({
      where: { companyId, userId },
      orderBy: { isDefault: 'desc' }
    })
  }

  async saveDashboardLayout(companyId: string, userId: string, widgets: any) {
    return this.prisma.dashboardLayout.upsert({
      where: { companyId_userId_isDefault: { companyId, userId, isDefault: true } },
      create: { companyId, userId, widgets: JSON.stringify(widgets), isDefault: true },
      update: { widgets: JSON.stringify(widgets) }
    })
  }
}

export const reportsService = new ReportsService()
