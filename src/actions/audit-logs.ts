'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { AuditLog, AuditModule, AuditAction } from '@prisma/client'

interface FilterOptions {
  userId?: string
  module?: AuditModule
  action?: AuditAction
  search?: string
  startDate?: Date
  endDate?: Date
}

/**
 * Obter logs de auditoria com filtros e paginação
 */
export async function getAuditLogs(
  companyId: string,
  filters: FilterOptions,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Verificar se é admin
    const userCompany = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    })

    if (!userCompany || userCompany.companyId !== companyId) {
      throw new Error('Forbidden')
    }

    // Apenas admins podem visualizar logs
    if (userCompany.role !== 'ADMIN' && userCompany.role !== 'MANAGER') {
      throw new Error('Forbidden - Admin only')
    }

    // Construir where clause dinamicamente
    const where: any = { companyId }

    if (filters.userId) where.userId = filters.userId
    if (filters.module) where.module = filters.module
    if (filters.action) where.action = filters.action
    if (filters.search) {
      where.OR = [
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { entityName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { userName: { contains: filters.search, mode: 'insensitive' } },
        { userEmail: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    // Executar query
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      success: true,
      data: {
        logs,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Obter estatísticas de auditoria
 */
export async function getAuditStats(companyId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Verificar permissão
    const userCompany = await prisma.user.findUnique({
      where: { id: user.id },
    })
    if (!userCompany || userCompany.companyId !== companyId) {
      throw new Error('Forbidden')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalActions,
      actionsToday,
      activeUsers,
      loginsToday,
      logsThisMonth,
      topModules,
      topUsers,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
          createdAt: { gte: today },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
          action: 'LOGIN',
          createdAt: { gte: today },
        },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
        },
      }),
      prisma.auditLog.groupBy({
        by: ['module'],
        where: { companyId },
        _count: true,
        orderBy: { _count: 'desc' },
        take: 5,
      }),
      prisma.auditLog.groupBy({
        by: ['userId', 'userName'],
        where: { companyId },
        _count: true,
        orderBy: { _count: 'desc' },
        take: 5,
      }),
    ])

    return {
      success: true,
      data: {
        totalActions,
        actionsToday,
        activeUsers: activeUsers.length,
        loginsToday,
        logsThisMonth,
        topModules: topModules.map((m) => ({
          module: m.module,
          count: m._count,
        })),
        topUsers: topUsers.map((u) => ({
          userId: u.userId,
          userName: u.userName,
          count: u._count,
        })),
      },
    }
  } catch (error) {
    console.error('Error fetching audit stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Exportar logs de auditoria em CSV
 */
export async function exportAuditLogsCSV(companyId: string, filters: FilterOptions) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Construir where clause
    const where: any = { companyId }
    if (filters.userId) where.userId = filters.userId
    if (filters.module) where.module = filters.module
    if (filters.action) where.action = filters.action
    if (filters.search) {
      where.OR = [
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { entityName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    // Montar CSV
    const headers = [
      'Data/Hora',
      'Usuário',
      'Email',
      'Módulo',
      'Ação',
      'Entidade',
      'ID',
      'Nome',
      'Descrição',
      'IP',
      'Navegador',
      'Status',
    ]

    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString('pt-BR'),
      log.userName,
      log.userEmail,
      log.module,
      log.action,
      log.entity,
      log.entityId,
      log.entityName || '',
      log.description || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.success ? 'Sucesso' : 'Erro',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    return {
      success: true,
      data: csv,
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Obter detalhes de um log específico
 */
export async function getAuditLogDetail(companyId: string, logId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const log = await prisma.auditLog.findFirst({
      where: {
        id: logId,
        companyId,
      },
    })

    if (!log) throw new Error('Log not found')

    return {
      success: true,
      data: {
        ...log,
        oldData: log.oldData ? JSON.parse(log.oldData) : null,
        newData: log.newData ? JSON.parse(log.newData) : null,
        changedFields: log.changedFields ? JSON.parse(log.changedFields) : [],
      },
    }
  } catch (error) {
    console.error('Error fetching audit log detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Obter lista de usuários para filtro
 */
export async function getAuditUsers(companyId: string) {
  try {
    const users = await prisma.auditLog.findMany({
      where: { companyId },
      distinct: ['userId'],
      select: {
        userId: true,
        userName: true,
        userEmail: true,
      },
      orderBy: { userName: 'asc' },
    })

    return {
      success: true,
      data: users.map((u) => ({
        value: u.userId,
        label: `${u.userName} (${u.userEmail})`,
      })),
    }
  } catch (error) {
    console.error('Error fetching audit users:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
