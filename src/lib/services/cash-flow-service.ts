import { prisma } from '@/lib/prisma'
import type { CashFlowSummary, FinancialDashboardKPIs } from '@/src/types/financial'
import { Decimal } from 'decimal.js'

export class CashFlowService {
  static async getCashFlowSummary(companyId: string): Promise<CashFlowSummary> {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get current balance from all accounts
    const accounts = await prisma.financialAccount.findMany({
      where: { companyId, isActive: true },
    })
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.balance.toNumber(), 0)

    // Get monthly movements
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        status: 'CONFIRMADA',
        movementDate: { gte: monthStart, lte: monthEnd },
      },
    })

    const monthlyInflow = movements
      .filter((m) => m.type === 'ENTRADA')
      .reduce((sum, m) => sum + m.value.toNumber(), 0)

    const monthlyOutflow = movements
      .filter((m) => m.type === 'SAIDA')
      .reduce((sum, m) => sum + m.value.toNumber(), 0)

    const monthlyProfit = monthlyInflow - monthlyOutflow

    // Placeholder for AR/AP integration
    const accountsReceivable = 0
    const accountsPayable = 0
    const pendingPayments = 0
    const pendingReceipts = 0

    return {
      currentBalance,
      monthlyInflow,
      monthlyOutflow,
      monthlyProfit,
      accountsReceivable,
      accountsPayable,
      pendingPayments,
      pendingReceipts,
    }
  }

  static async getFinancialDashboardKPIs(companyId: string): Promise<FinancialDashboardKPIs> {
    const summary = await this.getCashFlowSummary(companyId)

    // Calculate KPIs
    const totalRevenue = summary.monthlyInflow + summary.accountsReceivable
    const totalExpenses = summary.monthlyOutflow + summary.accountsPayable
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const averageTicket = 0 // TODO: Calculate from OS

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      averageTicket,
      outstandingValue: summary.accountsReceivable,
      pendingReceipts: summary.pendingReceipts,
      pendingPayments: summary.pendingPayments,
    }
  }

  static async calculateForecast(
    companyId: string,
    accountId: string,
    daysAhead: number
  ): Promise<{
    currentBalance: number
    projectedBalance: number
    projectedInflow: number
    projectedOutflow: number
  }> {
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
    })

    if (!account) throw new Error('Account not found')

    const now = new Date()
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    // Get movements from today to futureDate
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        accountId,
        movementDate: { gte: now, lte: futureDate },
      },
    })

    const projectedInflow = movements
      .filter((m) => m.type === 'ENTRADA')
      .reduce((sum, m) => sum + m.value.toNumber(), 0)

    const projectedOutflow = movements
      .filter((m) => m.type === 'SAIDA')
      .reduce((sum, m) => sum + m.value.toNumber(), 0)

    const projectedBalance = account.balance.toNumber() + projectedInflow - projectedOutflow

    return {
      currentBalance: account.balance.toNumber(),
      projectedBalance,
      projectedInflow,
      projectedOutflow,
    }
  }

  static async createAlertIfNegativeBalance(companyId: string): Promise<void> {
    const accounts = await prisma.financialAccount.findMany({
      where: { companyId, isActive: true },
    })

    for (const account of accounts) {
      if (account.balance.toNumber() < 0) {
        await prisma.financialAlert.create({
          data: {
            companyId,
            alertType: 'CAIXA_NEGATIVO',
            severity: 'DANGER',
            description: `Saldo negativo em ${account.name}`,
            relatedId: account.id,
          },
        })
      }
    }
  }

  static async getMonthlyChartData(companyId: string) {
    const movements = await prisma.cashMovement.findMany({
      where: { companyId, status: 'CONFIRMADA' },
      orderBy: { movementDate: 'asc' },
    })

    const monthlyData: Record<string, { inflow: number; outflow: number }> = {}

    for (const movement of movements) {
      const monthKey = movement.movementDate.toISOString().substring(0, 7)

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { inflow: 0, outflow: 0 }
      }

      if (movement.type === 'ENTRADA') {
        monthlyData[monthKey].inflow += movement.value.toNumber()
      } else if (movement.type === 'SAIDA') {
        monthlyData[monthKey].outflow += movement.value.toNumber()
      }
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }))
  }

  static async getExpenseCategoryBreakdown(companyId: string) {
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        status: 'CONFIRMADA',
        type: 'SAIDA',
      },
      include: { category: true },
    })

    const categoryData: Record<string, number> = {}

    for (const movement of movements) {
      const categoryName = movement.category?.name || 'Sem categoria'
      categoryData[categoryName] = (categoryData[categoryName] || 0) + movement.value.toNumber()
    }

    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }))
  }
}
