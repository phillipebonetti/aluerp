import prisma from '@/lib/prisma'

export class ReceivableDashboardService {
  static async getDashboardData(companyId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    // Total to receive
    const totalReceivable = await prisma.accountsReceivable.aggregate({
      where: { companyId, status: { not: 'CANCELADO' } },
      _sum: { totalValue: true },
    })

    // Received this month
    const receivedThisMonth = await prisma.receivablePayment.aggregate({
      where: {
        company: { id: companyId },
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    })

    // Overdue
    const overdue = await prisma.receivableInstallment.aggregate({
      where: {
        accountsReceivable: { companyId },
        dueDate: { lt: now },
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
      _sum: { value: true },
    })

    // Today's receipts
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    const todayReceipts = await prisma.receivablePayment.aggregate({
      where: {
        company: { id: companyId },
        paymentDate: { gte: today, lt: tomorrowStart },
      },
      _sum: { amount: true },
    })

    // Week's receipts
    const weekReceipts = await prisma.receivablePayment.aggregate({
      where: {
        company: { id: companyId },
        paymentDate: { gte: startOfWeek },
      },
      _sum: { amount: true },
    })

    // Pending commissions
    const pendingCommissions = await prisma.commissionPayment.aggregate({
      where: {
        companyId,
        status: { in: ['PENDING', 'APPROVED'] },
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
      },
      _sum: { approvedCommission: true },
    })

    return {
      totalToReceive: totalReceivable._sum.totalValue?.toNumber() || 0,
      receivedThisMonth: receivedThisMonth._sum.amount?.toNumber() || 0,
      overdue: overdue._sum.value?.toNumber() || 0,
      todayReceipts: todayReceipts._sum.amount?.toNumber() || 0,
      weekReceipts: weekReceipts._sum.amount?.toNumber() || 0,
      pendingCommissions: pendingCommissions._sum.approvedCommission?.toNumber() || 0,
    }
  }

  static async getReceiptsChartData(companyId: string) {
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }).substring(0, 3),
        date,
      })
    }

    const chartData = await Promise.all(
      months.map(async ({ month, date }) => {
        const startMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)

        const receipts = await prisma.receivablePayment.aggregate({
          where: {
            company: { id: companyId },
            paymentDate: { gte: startMonth, lt: endMonth },
          },
          _sum: { amount: true },
        })

        return {
          month,
          receipts: receipts._sum.amount?.toNumber() || 0,
        }
      })
    )

    return chartData
  }

  static async getDefaultersChartData(companyId: string) {
    const defaulters = await prisma.accountsReceivable.findMany({
      where: {
        companyId,
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO', 'VENCIDO'] },
      },
      select: { status: true, finalBalance: true },
    })

    return [
      {
        name: 'Aberto',
        value: defaulters.filter((d) => d.status === 'ABERTO').reduce((sum, d) => sum + d.finalBalance.toNumber(), 0),
      },
      {
        name: 'Parcial',
        value: defaulters.filter((d) => d.status === 'PARCIALMENTE_RECEBIDO').reduce((sum, d) => sum + d.finalBalance.toNumber(), 0),
      },
      {
        name: 'Vencido',
        value: defaulters.filter((d) => d.status === 'VENCIDO').reduce((sum, d) => sum + d.finalBalance.toNumber(), 0),
      },
    ]
  }

  static async getRevenueChartData(companyId: string) {
    const revenues = await prisma.receivablePayment.findMany({
      where: { company: { id: companyId } },
      select: { amount: true, paymentDate: true },
    })

    const grouped: Record<string, number> = {}
    revenues.forEach((r) => {
      const monthKey = r.paymentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      grouped[monthKey] = (grouped[monthKey] || 0) + r.amount.toNumber()
    })

    return Object.entries(grouped).map(([month, value]) => ({ month, value }))
  }

  static async getTopClientsChartData(companyId: string) {
    const topClients = await prisma.accountsReceivable.groupBy({
      by: ['clientId'],
      where: { companyId },
      _sum: { receivedValue: true, totalValue: true },
      orderBy: { _sum: { receivedValue: 'desc' } },
      take: 5,
    })

    const clientsWithNames = await Promise.all(
      topClients.map(async (client) => {
        const clientData = await prisma.client.findUnique({ where: { id: client.clientId } })
        return {
          name: clientData?.name || 'Desconhecido',
          received: client._sum.receivedValue?.toNumber() || 0,
          total: client._sum.totalValue?.toNumber() || 0,
        }
      })
    )

    return clientsWithNames
  }
}
