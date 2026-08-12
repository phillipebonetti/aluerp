import { prisma } from '@/src/lib/prisma'
import { Decimal } from 'decimal.js'

export class CashFlowAlertsService {
  static async checkAndCreateAlerts(companyId: string) {
    const alerts: any[] = []

    // 1. Check negative balance
    const account = await prisma.financialAccount.findFirst({
      where: { companyId, isActive: true },
    })

    if (account && account.balance.toNumber() < 0) {
      alerts.push({
        alertType: 'CAIXA_NEGATIVO',
        severity: 'DANGER',
        description: `Saldo negativo: R$ ${account.balance.toNumber()}`,
      })
    }

    // 2. Check overdue receivables
    const overdueReceivables = await prisma.receivableInstallment.count({
      where: {
        accountsReceivable: { companyId },
        dueDate: { lt: new Date() },
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
    })

    if (overdueReceivables > 0) {
      alerts.push({
        alertType: 'RECEBIMENTO_ATRASADO',
        severity: 'WARNING',
        description: `${overdueReceivables} recebimentos vencidos`,
      })
    }

    // 3. Check upcoming receivables (7 days)
    const upcomingDate = new Date()
    upcomingDate.setDate(upcomingDate.getDate() + 7)

    const upcomingReceivables = await prisma.receivableInstallment.count({
      where: {
        accountsReceivable: { companyId },
        dueDate: { lte: upcomingDate, gte: new Date() },
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
    })

    if (upcomingReceivables > 0) {
      alerts.push({
        alertType: 'VENCENDO_LOGO',
        severity: 'INFO',
        description: `${upcomingReceivables} recebimentos vencendo em 7 dias`,
      })
    }

    // 4. Create alerts in database
    for (const alert of alerts) {
      await prisma.financialAlert.create({
        data: {
          companyId,
          ...alert,
        },
      })
    }

    return alerts
  }

  static async getActiveAlerts(companyId: string) {
    return await prisma.financialAlert.findMany({
      where: {
        companyId,
        isResolved: false,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async resolveAlert(alertId: string) {
    return await prisma.financialAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    })
  }
}
