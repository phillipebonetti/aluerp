import { prisma } from '@/lib/prisma'

export class SalesGoalsService {
  /**
   * Obter meta de um vendedor para um mês específico
   */
  static async getGoal(employeeId: string, year: number, month: number) {
    return prisma.salesGoal.findUnique({
      where: {
        companyId_year_month_employeeId: {
          companyId: '', // Will need to be passed
          year,
          month,
          employeeId,
        },
      },
    })
  }

  /**
   * Criar ou atualizar meta mensal
   */
  static async upsertGoal(
    companyId: string,
    employeeId: string,
    year: number,
    month: number,
    revenueTarget: number,
    quantityTarget?: number,
    conversionTarget?: number
  ) {
    return prisma.salesGoal.upsert({
      where: {
        companyId_year_month_employeeId: { companyId, year, month, employeeId },
      },
      update: {
        revenueTarget,
        quantityTarget,
        conversionTarget,
      },
      create: {
        companyId,
        employeeId,
        year,
        month,
        revenueTarget,
        quantityTarget,
        conversionTarget,
      },
    })
  }

  /**
   * Obter progresso de meta (realizado até agora)
   */
  static async getGoalProgress(employeeId: string, year: number, month: number) {
    const goal = await prisma.salesGoal.findFirst({
      where: {
        employeeId,
        year,
        month,
      },
    })

    if (!goal) {
      return null
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Calcular vendas realizadas
    const serviceOrders = await prisma.serviceOrder.findMany({
      where: {
        vendedorId: employeeId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: { not: 'CANCELLED' },
      },
    })

    const achievedRevenue = serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0)

    return {
      goal,
      achieved: achievedRevenue,
      percentage: (achievedRevenue / goal.revenueTarget) * 100,
      remaining: Math.max(0, goal.revenueTarget - achievedRevenue),
      ordersCount: serviceOrders.length,
    }
  }

  /**
   * Obter metas de todos os vendedores para um mês
   */
  static async getTeamGoals(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const salespeople = await prisma.employee.findMany({
      where: {
        companyId,
        isSalesperson: true,
      },
      include: {
        salesGoals: {
          where: { year, month },
        },
        serviceOrders: {
          where: {
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
            status: { not: 'CANCELLED' },
          },
        },
      },
    })

    return salespeople.map((sp) => {
      const goal = sp.salesGoals[0]
      const achievedRevenue = sp.serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0)
      const percentage = goal ? (achievedRevenue / goal.revenueTarget) * 100 : 0

      return {
        employeeId: sp.id,
        employeeName: sp.name,
        goalTarget: goal?.revenueTarget || 0,
        achievedRevenue,
        percentage: Math.min(percentage, 150),
        remaining: Math.max(0, (goal?.revenueTarget || 0) - achievedRevenue),
        ordersCount: sp.serviceOrders.length,
        status: goal?.status || 'NOT_SET',
      }
    })
  }

  /**
   * Comparar desempenho com mês anterior
   */
  static async compareWithPreviousMonth(employeeId: string, year: number, month: number) {
    const currentProgress = await this.getGoalProgress(employeeId, year, month)

    // Mês anterior
    let prevMonth = month - 1
    let prevYear = year
    if (prevMonth < 1) {
      prevMonth = 12
      prevYear -= 1
    }

    const previousProgress = await this.getGoalProgress(employeeId, prevYear, prevMonth)

    if (!currentProgress) {
      return { current: null, previous: previousProgress, growth: 0 }
    }

    const growth =
      previousProgress && previousProgress.achieved > 0
        ? ((currentProgress.achieved - previousProgress.achieved) / previousProgress.achieved) * 100
        : 0

    return {
      current: currentProgress,
      previous: previousProgress,
      growth,
    }
  }

  /**
   * Obter performance anual
   */
  static async getAnnualPerformance(companyId: string, year: number) {
    const data = []

    for (let month = 1; month <= 12; month++) {
      const goals = await this.getTeamGoals(companyId, year, month)

      const totalGoal = goals.reduce((sum, g) => sum + g.goalTarget, 0)
      const totalAchieved = goals.reduce((sum, g) => sum + g.achievedRevenue, 0)
      const avgPercentage = goals.length > 0 ? goals.reduce((sum, g) => sum + g.percentage, 0) / goals.length : 0

      data.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' }),
        totalGoal,
        totalAchieved,
        avgPercentage,
        vendorsAboveGoal: goals.filter((g) => g.percentage >= 100).length,
        vendorsBelowGoal: goals.filter((g) => g.percentage < 100).length,
      })
    }

    return data
  }

  /**
   * Identificar vendedores em risco (abaixo de meta)
   */
  static async getAtRiskVendors(companyId: string, year: number, month: number, threshold = 70) {
    const goals = await this.getTeamGoals(companyId, year, month)

    return goals
      .filter((g) => g.percentage < threshold && g.percentage > 0)
      .sort((a, b) => a.percentage - b.percentage)
  }

  /**
   * Obter star performers (acima de meta)
   */
  static async getStarPerformers(companyId: string, year: number, month: number) {
    const goals = await this.getTeamGoals(companyId, year, month)

    return goals.filter((g) => g.percentage >= 100).sort((a, b) => b.percentage - a.percentage)
  }

  /**
   * Calcular projeção de meta (baseado em performance atual)
   */
  static async getProjectedPerformance(employeeId: string, year: number, month: number) {
    const today = new Date()
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysElapsed = Math.min(today.getDate(), daysInMonth)
    const daysRemaining = daysInMonth - daysElapsed

    const progress = await this.getGoalProgress(employeeId, year, month)

    if (!progress) {
      return null
    }

    // Projetar com base na velocidade atual
    const dailyAverage = progress.achieved / daysElapsed
    const projectedTotal = progress.achieved + dailyAverage * daysRemaining

    const projectedPercentage = (projectedTotal / progress.goal.revenueTarget) * 100

    return {
      currentAchieved: progress.achieved,
      daysElapsed,
      daysRemaining,
      dailyAverage,
      projectedTotal,
      projectedPercentage: Math.min(projectedPercentage, 150),
      willAchieveGoal: projectedPercentage >= 100,
      remainingNeeded: Math.max(0, progress.goal.revenueTarget - progress.achieved),
      dailyTargetNeeded:
        daysRemaining > 0 ? Math.max(0, progress.goal.revenueTarget - progress.achieved) / daysRemaining : 0,
    }
  }
}
