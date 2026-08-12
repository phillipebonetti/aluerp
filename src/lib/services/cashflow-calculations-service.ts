import { prisma } from '@/src/lib/prisma'
import { Decimal } from 'decimal.js'

export class CashFlowCalculationsService {
  /**
   * Calcula saldo atual por conta
   */
  static async getCurrentBalance(companyId: string, accountId?: string) {
    if (accountId) {
      const account = await prisma.financialAccount.findUnique({
        where: { id: accountId },
      })
      return account?.balance || new Decimal(0)
    }

    // Total de todas as contas ativas
    const accounts = await prisma.financialAccount.findMany({
      where: { companyId, isActive: true },
    })

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance.toNumber(), 0)
    return new Decimal(totalBalance)
  }

  /**
   * Calcula entradas e saídas de um período
   */
  static async getFlowByPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    type?: string
  ) {
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        status: 'CONFIRMADA',
        movementDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(type && { type }),
      },
    })

    let totalInflow = new Decimal(0)
    let totalOutflow = new Decimal(0)

    for (const mov of movements) {
      if (mov.type === 'ENTRADA') {
        totalInflow = totalInflow.plus(mov.value)
      } else if (mov.type === 'SAIDA') {
        totalOutflow = totalOutflow.plus(mov.value)
      }
    }

    const balance = totalInflow.minus(totalOutflow)

    return {
      inflow: totalInflow,
      outflow: totalOutflow,
      balance,
      movements: movements.length,
    }
  }

  /**
   * Calcula fluxo diário para gráfico
   */
  static async getDailyFlow(companyId: string, daysBack: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        status: 'CONFIRMADA',
        movementDate: { gte: startDate, lte: endDate },
      },
      orderBy: { movementDate: 'asc' },
    })

    // Agregar por dia
    const dailyData: Record<string, { inflow: number; outflow: number; balance: number }> = {}

    for (const mov of movements) {
      const day = mov.movementDate.toISOString().split('T')[0]
      if (!dailyData[day]) {
        dailyData[day] = { inflow: 0, outflow: 0, balance: 0 }
      }

      if (mov.type === 'ENTRADA') {
        dailyData[day].inflow += mov.value.toNumber()
      } else if (mov.type === 'SAIDA') {
        dailyData[day].outflow += mov.value.toNumber()
      }
    }

    // Calcular saldo acumulado
    let cumulativeBalance = 0
    const result = Object.entries(dailyData).map(([date, data]) => {
      cumulativeBalance += data.inflow - data.outflow
      return {
        date,
        inflow: data.inflow,
        outflow: data.outflow,
        balance: cumulativeBalance,
      }
    })

    return result
  }

  /**
   * Calcula fluxo mensal (últimos 12 meses)
   */
  static async getMonthlyFlow(companyId: string) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        status: 'CONFIRMADA',
        movementDate: { gte: startDate, lte: endDate },
      },
    })

    const monthlyData: Record<string, { inflow: number; outflow: number }> = {}

    for (const mov of movements) {
      const month = mov.movementDate.toISOString().substring(0, 7) // YYYY-MM

      if (!monthlyData[month]) {
        monthlyData[month] = { inflow: 0, outflow: 0 }
      }

      if (mov.type === 'ENTRADA') {
        monthlyData[month].inflow += mov.value.toNumber()
      } else if (mov.type === 'SAIDA') {
        monthlyData[month].outflow += mov.value.toNumber()
      }
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      inflow: data.inflow,
      outflow: data.outflow,
      result: data.inflow - data.outflow,
    }))
  }

  /**
   * Calcula receitas por categoria
   */
  static async getRevenueByCategory(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        type: 'ENTRADA',
        status: 'CONFIRMADA',
        movementDate: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    })

    const categoryData: Record<string, number> = {}

    for (const mov of movements) {
      const categoryName = mov.category?.name || 'Sem Categoria'
      categoryData[categoryName] = (categoryData[categoryName] || 0) + mov.value.toNumber()
    }

    return Object.entries(categoryData).map(([category, value]) => ({
      category,
      value,
    }))
  }

  /**
   * Calcula despesas por categoria
   */
  static async getExpensesByCategory(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        type: 'SAIDA',
        status: 'CONFIRMADA',
        movementDate: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    })

    const categoryData: Record<string, number> = {}

    for (const mov of movements) {
      const categoryName = mov.category?.name || 'Sem Categoria'
      categoryData[categoryName] = (categoryData[categoryName] || 0) + mov.value.toNumber()
    }

    return Object.entries(categoryData).map(([category, value]) => ({
      category,
      value,
    }))
  }

  /**
   * Calcula previsão de fluxo
   */
  static async calculateForecast(
    companyId: string,
    accountId: string,
    daysAhead: number = 30
  ) {
    // Buscar contas a receber dentro do período
    const receivables = await prisma.receivableInstallment.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
        },
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
      include: { accountsReceivable: { where: { companyId } } },
    })

    const totalReceivable = receivables.reduce(
      (sum, r) => sum + (r.value.toNumber() - r.receivedValue.toNumber()),
      0
    )

    // Calcular saldo previsto
    const currentBalance = await this.getCurrentBalance(companyId, accountId)
    const forecastBalance = currentBalance.toNumber() + totalReceivable

    return {
      currentBalance: currentBalance.toNumber(),
      forecastedInflow: totalReceivable,
      forecastedBalance: forecastBalance,
      daysAhead,
    }
  }

  /**
   * Calcula KPIs principais
   */
  static async getMainKPIs(companyId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    const todayFlow = await this.getFlowByPeriod(companyId, today, today)
    const monthFlow = await this.getFlowByPeriod(companyId, startOfMonth, today)
    const yearFlow = await this.getFlowByPeriod(companyId, startOfYear, today)

    const currentBalance = await this.getCurrentBalance(companyId)

    // Contas a receber vencendo nos próximos 30 dias
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)

    const receivingDue = await prisma.receivableInstallment.aggregate({
      where: {
        accountsReceivable: { companyId },
        dueDate: { lte: nextMonth },
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
      _sum: { value: true },
    })

    return {
      currentBalance: currentBalance.toNumber(),
      todayInflow: todayFlow.inflow.toNumber(),
      todayOutflow: todayFlow.outflow.toNumber(),
      monthInflow: monthFlow.inflow.toNumber(),
      monthOutflow: monthFlow.outflow.toNumber(),
      monthResult: monthFlow.balance.toNumber(),
      yearInflow: yearFlow.inflow.toNumber(),
      yearOutflow: yearFlow.outflow.toNumber(),
      yearResult: yearFlow.balance.toNumber(),
      receivingDue30Days: receivingDue._sum.value?.toNumber() || 0,
    }
  }
}
