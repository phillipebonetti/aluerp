import { prisma } from '@/lib/prisma'

export class SalesDashboardService {
  /**
   * Obter KPIs principais do mês
   */
  static async getMonthlyKPIs(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Vendas do mês
    const salesOrders = await prisma.serviceOrder.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate, lt: endDate },
        status: { not: 'CANCELLED' },
      },
      include: { osCommissions: true, vendedor: true },
    })

    const totalSalesValue = salesOrders.reduce((sum, so) => sum + Number(so.totalValue), 0)
    const totalCommissions = salesOrders.reduce(
      (sum, so) => sum + so.osCommissions.reduce((c, com) => c + Number(com.commissionValue), 0),
      0
    )

    // Salespeople com vendas
    const topSalespeople = await prisma.employee.findMany({
      where: {
        companyId,
        isSalesperson: true,
        serviceOrders: {
          some: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' },
          },
        },
      },
      include: {
        serviceOrders: {
          where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' },
          },
          include: { osCommissions: true },
        },
      },
      take: 5,
    })

    const topSalesPeopleData = topSalespeople.map((sp) => ({
      id: sp.id,
      name: sp.name,
      totalValue: sp.serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0),
      commission: sp.serviceOrders.reduce(
        (sum, so) => sum + so.osCommissions.reduce((c, com) => c + Number(com.commissionValue), 0),
        0
      ),
      ordersCount: sp.serviceOrders.length,
    }))

    return {
      totalSalesValue,
      totalCommissions,
      ordersCount: salesOrders.length,
      averageTicket: salesOrders.length > 0 ? totalSalesValue / salesOrders.length : 0,
      topSalespeople: topSalesPeopleData,
    }
  }

  /**
   * Obter dados para gráfico de vendas por vendedor
   */
  static async getSalesByVendor(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const salespeople = await prisma.employee.findMany({
      where: {
        companyId,
        isSalesperson: true,
      },
      include: {
        serviceOrders: {
          where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' },
          },
          include: { osCommissions: true },
        },
      },
    })

    return salespeople
      .map((sp) => ({
        name: sp.name,
        value: sp.serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0),
        commission: sp.serviceOrders.reduce(
          (sum, so) => sum + so.osCommissions.reduce((c, com) => c + Number(com.commissionValue), 0),
          0
        ),
      }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value)
  }

  /**
   * Evolução mensal de vendas
   */
  static async getMonthlySalesEvolution(companyId: string, year: number) {
    const data = []

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)

      const sales = await prisma.serviceOrder.findMany({
        where: {
          companyId,
          createdAt: { gte: startDate, lt: endDate },
          status: { not: 'CANCELLED' },
        },
        include: { osCommissions: true },
      })

      const totalValue = sales.reduce((sum, so) => sum + Number(so.totalValue), 0)
      const totalCommissions = sales.reduce(
        (sum, so) => sum + so.osCommissions.reduce((c, com) => c + Number(com.commissionValue), 0),
        0
      )

      data.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' }),
        sales: totalValue,
        commission: totalCommissions,
        ordersCount: sales.length,
      })
    }

    return data
  }

  /**
   * Comissões por mês
   */
  static async getCommissionMonthly(companyId: string, year: number) {
    const data = []

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)

      const payments = await prisma.commissionPayment.findMany({
        where: {
          companyId,
          referenceYear: year,
          referenceMonth: month,
        },
      })

      const approved = payments.filter((p) => p.status === 'APPROVED').reduce((sum, p) => sum + Number(p.approvedCommission), 0)
      const paid = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + Number(p.paidAmount), 0)
      const pending = payments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.totalCommission), 0)

      data.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' }),
        approved,
        paid,
        pending,
        total: approved + paid + pending,
      })
    }

    return data
  }

  /**
   * Meta vs Realizado
   */
  static async getGoalProgress(companyId: string, year: number, month: number) {
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
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
            status: { not: 'CANCELLED' },
          },
        },
      },
    })

    return salespeople.map((sp) => {
      const goal = sp.salesGoals[0]
      const achieved = sp.serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0)
      const percentage = goal ? (achieved / goal.revenueTarget) * 100 : 0

      return {
        id: sp.id,
        name: sp.name,
        goal: goal?.revenueTarget || 0,
        achieved,
        percentage: Math.min(percentage, 100),
        remaining: Math.max(0, (goal?.revenueTarget || 0) - achieved),
      }
    })
  }

  /**
   * Ranking de vendedores
   */
  static async getVendorRanking(companyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const ranking = await prisma.employee.findMany({
      where: {
        companyId,
        isSalesperson: true,
      },
      include: {
        serviceOrders: {
          where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' },
          },
          include: { osCommissions: true },
        },
      },
    })

    return ranking
      .map((sp, index) => ({
        position: index + 1,
        name: sp.name,
        salesValue: sp.serviceOrders.reduce((sum, so) => sum + Number(so.totalValue), 0),
        commission: sp.serviceOrders.reduce(
          (sum, so) => sum + so.osCommissions.reduce((c, com) => c + Number(com.commissionValue), 0),
          0
        ),
        ordersCount: sp.serviceOrders.length,
      }))
      .sort((a, b) => b.salesValue - a.salesValue)
      .slice(0, 10)
  }
}
