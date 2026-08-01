'use server'

import { AuditService } from '@/src/lib/audit/service'
import { AuditModule, AuditAction } from '@prisma/client'
import { prisma } from '@/src/db'

export async function getAuditHistoryAction(
  companyId: string,
  entity: string,
  entityId: string,
  limit = 50,
  offset = 0
) {
  try {
    const history = await AuditService.getEntityHistory(
      companyId,
      entity,
      entityId,
      limit,
      offset
    )
    return { success: true, data: history }
  } catch (error) {
    console.error('[v0] Error getting audit history:', error)
    return { success: false, error: 'Erro ao obter histórico' }
  }
}

export async function getAuditTimelineAction(
  companyId: string,
  entity: string,
  entityId: string
) {
  try {
    const timeline = await AuditService.getEntityTimeline(
      companyId,
      entity,
      entityId
    )
    return { success: true, data: timeline }
  } catch (error) {
    console.error('[v0] Error getting audit timeline:', error)
    return { success: false, error: 'Erro ao obter timeline' }
  }
}

export async function getAuditLogsAction(
  companyId: string,
  filters: {
    userId?: string
    module?: AuditModule
    action?: AuditAction
    entity?: string
    startDate?: Date
    endDate?: Date
    search?: string
  },
  limit = 100,
  offset = 0
) {
  try {
    const result = await AuditService.getLogs(
      companyId,
      filters,
      limit,
      offset
    )
    return { success: true, data: result }
  } catch (error) {
    console.error('[v0] Error getting audit logs:', error)
    return { success: false, error: 'Erro ao obter logs' }
  }
}

export async function getAuditStatisticsAction(
  companyId: string,
  days = 30
) {
  try {
    const stats = await AuditService.getStatistics(companyId, days)
    return { success: true, data: stats }
  } catch (error) {
    console.error('[v0] Error getting audit statistics:', error)
    return { success: false, error: 'Erro ao obter estatísticas' }
  }
}

export async function exportAuditLogsAction(
  companyId: string,
  format: 'csv' | 'json',
  filters: {
    userId?: string
    module?: AuditModule
    action?: AuditAction
    entity?: string
    startDate?: Date
    endDate?: Date
  }
) {
  try {
    const result = await AuditService.getLogs(companyId, filters, 10000, 0)
    
    if (format === 'csv') {
      return { success: true, data: convertToCSV(result.logs) }
    } else {
      return { success: true, data: JSON.stringify(result.logs, null, 2) }
    }
  } catch (error) {
    console.error('[v0] Error exporting audit logs:', error)
    return { success: false, error: 'Erro ao exportar logs' }
  }
}

function convertToCSV(logs: any[]): string {
  const headers = [
    'Data/Hora',
    'Usuário',
    'Email',
    'Módulo',
    'Ação',
    'Entidade',
    'ID Entidade',
    'Nome Entidade',
    'Descrição',
    'Endereço IP',
  ]

  const rows = logs.map((log) => [
    new Date(log.createdAt).toLocaleString('pt-BR'),
    log.userName,
    log.userEmail,
    log.module,
    log.action,
    log.entity,
    log.entityId,
    log.entityName || '-',
    log.description || '-',
    log.ipAddress || '-',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell}"`
            : cell
        )
        .join(',')
    ),
  ].join('\n')

  return csv
}

export async function getUsersForFilterAction(companyId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { companyId },
      distinct: ['userId'],
      select: {
        userId: true,
        userName: true,
        userEmail: true,
      },
    })

    return {
      success: true,
      data: logs.map((log) => ({
        value: log.userId,
        label: `${log.userName} (${log.userEmail})`,
      })),
    }
  } catch (error) {
    console.error('[v0] Error getting users for filter:', error)
    return { success: false, error: 'Erro ao obter usuários' }
  }
}

export async function getEntitiesForSearchAction(
  companyId: string,
  search: string
) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        companyId,
        OR: [
          { entityName: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        entityId: true,
        entityName: true,
        entity: true,
      },
    })

    const unique = Array.from(
      new Map(logs.map((log) => [log.entityId, log])).values()
    )

    return {
      success: true,
      data: unique.map((log) => ({
        id: log.entityId,
        label: log.entityName || log.entityId,
        entity: log.entity,
      })),
    }
  } catch (error) {
    console.error('[v0] Error searching entities:', error)
    return { success: false, error: 'Erro ao pesquisar entidades' }
  }
}
