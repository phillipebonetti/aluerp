import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export class ARAlertService {
  static async checkAndCreateAlerts(companyId: string) {
    const now = new Date()
    const alerts = []

    // Get all open and partially received accounts
    const receivables = await prisma.accountsReceivable.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { in: ['ABERTO', 'PARCIALMENTE_RECEBIDO'] },
      },
      include: { client: true },
    })

    for (const receivable of receivables) {
      const daysUntilDue = Math.ceil((receivable.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Check if overdue
      if (receivable.dueDate < now && receivable.finalBalance.toNumber() > 0) {
        await this.createAlert({
          companyId,
          alertType: 'VENCIDO',
          severity: 'DANGER',
          description: `Conta a receber vencida: ${receivable.client.name} - ${receivable.documentNumber}`,
          relatedId: receivable.id,
        })
      }

      // Check if due today
      if (daysUntilDue === 0) {
        await this.createAlert({
          companyId,
          alertType: 'VENCENDO_HOJE',
          severity: 'WARNING',
          description: `Conta a receber vence hoje: ${receivable.client.name} - ${receivable.documentNumber}`,
          relatedId: receivable.id,
        })
      }

      // Check if due in 3 days
      if (daysUntilDue === 3) {
        await this.createAlert({
          companyId,
          alertType: 'VENCENDO_PROXIMO',
          severity: 'INFO',
          description: `Conta a receber vence em 3 dias: ${receivable.client.name} - ${receivable.documentNumber}`,
          relatedId: receivable.id,
        })
      }

      // Check for partial receivables
      if (
        receivable.status === 'PARCIALMENTE_RECEBIDO' &&
        receivable.finalBalance.toNumber() > 0
      ) {
        await this.createAlert({
          companyId,
          alertType: 'RECEBIMENTO_PARCIAL',
          severity: 'INFO',
          description: `Recebimento parcial pendente: ${receivable.client.name} - Saldo: R$ ${receivable.finalBalance.toNumber().toFixed(2)}`,
          relatedId: receivable.id,
        })
      }
    }

    // Check for default clients (multiple overdue accounts)
    const clientsWithOverdue = await prisma.accountsReceivable.groupBy({
      by: ['clientId'],
      where: {
        companyId,
        deletedAt: null,
        status: 'VENCIDO',
      },
      _count: true,
    })

    for (const clientData of clientsWithOverdue) {
      if (clientData._count >= 2) {
        const client = await prisma.client.findUnique({
          where: { id: clientData.clientId },
        })

        if (client) {
          await this.createAlert({
            companyId,
            alertType: 'CLIENTE_INADIMPLENTE',
            severity: 'DANGER',
            description: `Cliente inadimplente: ${client.name} - ${clientData._count} contas vencidas`,
            relatedId: clientData.clientId,
          })
        }
      }
    }

    return alerts
  }

  static async createAlert(data: {
    companyId: string
    alertType: string
    severity: string
    description: string
    relatedId?: string
  }) {
    // Check if alert already exists
    const existingAlert = await prisma.financialAlert.findFirst({
      where: {
        companyId: data.companyId,
        alertType: data.alertType,
        relatedId: data.relatedId,
        isResolved: false,
      },
    })

    if (existingAlert) return existingAlert

    return await prisma.financialAlert.create({
      data: {
        companyId: data.companyId,
        alertType: data.alertType,
        severity: data.severity,
        description: data.description,
        relatedId: data.relatedId,
        isResolved: false,
      },
    })
  }

  static async getAlerts(companyId: string, options?: { severity?: string; resolved?: boolean }) {
    const where: any = { companyId }

    if (options?.severity) where.severity = options.severity
    if (options?.resolved !== undefined) where.isResolved = options.resolved

    return await prisma.financialAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  static async resolveAlert(companyId: string, alertId: string) {
    return await prisma.financialAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    })
  }

  static async getAlertsSummary(companyId: string) {
    const alerts = await prisma.financialAlert.findMany({
      where: {
        companyId,
        isResolved: false,
      },
    })

    return {
      total: alerts.length,
      danger: alerts.filter((a) => a.severity === 'DANGER').length,
      warning: alerts.filter((a) => a.severity === 'WARNING').length,
      info: alerts.filter((a) => a.severity === 'INFO').length,
    }
  }
}
