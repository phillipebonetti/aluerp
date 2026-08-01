import { prisma } from '@/src/db'
import { AuditAction, AuditModule } from '@prisma/client'
import { headers } from 'next/headers'

export interface AuditLogInput {
  companyId: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  module: AuditModule
  action: AuditAction
  entity: string
  entityId: string
  entityName?: string
  oldData?: Record<string, any>
  newData?: Record<string, any>
  description?: string
  success?: boolean
  errorMessage?: string
}

export class AuditService {
  /**
   * Registra uma ação de auditoria
   */
  static async log(input: AuditLogInput): Promise<void> {
    try {
      const headersList = await headers()
      const ipAddress = headersList.get('x-forwarded-for') || 
                       headersList.get('x-real-ip') || 
                       'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'

      // Determinar campos alterados
      const changedFields = this.getChangedFields(input.oldData, input.newData)

      await prisma.auditLog.create({
        data: {
          companyId: input.companyId,
          userId: input.userId,
          userName: input.userName,
          userEmail: input.userEmail,
          userRole: input.userRole,
          module: input.module,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          entityName: input.entityName,
          oldData: input.oldData ? JSON.stringify(input.oldData) : null,
          newData: input.newData ? JSON.stringify(input.newData) : null,
          changedFields: changedFields ? JSON.stringify(changedFields) : null,
          ipAddress: ipAddress,
          userAgent: userAgent,
          description: input.description,
          success: input.success ?? true,
          errorMessage: input.errorMessage,
        },
      })
    } catch (error) {
      console.error('[v0] Erro ao registrar audit log:', error)
      // Não lançar erro para não quebrar a ação principal
    }
  }

  /**
   * Obtém histórico de uma entidade
   */
  static async getEntityHistory(
    companyId: string,
    entity: string,
    entityId: string,
    limit = 50,
    offset = 0
  ) {
    return await prisma.auditLog.findMany({
      where: {
        companyId,
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Compara antes e depois
   */
  static compareChanges(oldData?: Record<string, any>, newData?: Record<string, any>) {
    if (!oldData || !newData) return null

    const changes: Record<string, { before: any; after: any }> = {}

    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {}),
    ])

    allKeys.forEach((key) => {
      const oldValue = oldData?.[key]
      const newValue = newData?.[key]

      if (oldValue !== newValue) {
        changes[key] = {
          before: oldValue,
          after: newValue,
        }
      }
    })

    return Object.keys(changes).length > 0 ? changes : null
  }

  /**
   * Obtém campos alterados
   */
  private static getChangedFields(
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ): string[] | null {
    if (!oldData || !newData) return null

    const changedFields: string[] = []
    const allKeys = new Set([
      ...Object.keys(oldData),
      ...Object.keys(newData),
    ])

    allKeys.forEach((key) => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key)
      }
    })

    return changedFields.length > 0 ? changedFields : null
  }

  /**
   * Obtém logs com filtros
   */
  static async getLogs(
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
    const where: any = { companyId }

    if (filters.userId) where.userId = filters.userId
    if (filters.module) where.module = filters.module
    if (filters.action) where.action = filters.action
    if (filters.entity) where.entity = filters.entity

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    if (filters.search) {
      where.OR = [
        { entityName: { contains: filters.search, mode: 'insensitive' } },
        { userName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { entityId: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return { logs, total, pages: Math.ceil(total / limit) }
  }

  /**
   * Obtém estatísticas de auditoria
   */
  static async getStatistics(companyId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [
      totalActions,
      activeUsers,
      actionsToday,
      loginsToday,
      failedLogins,
      deletions,
      creations,
      updates,
    ] = await Promise.all([
      prisma.auditLog.count({ where: { companyId, createdAt: { gte: startDate } } }),
      prisma.auditLog.findMany({
        where: { companyId, createdAt: { gte: startDate } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
          action: 'LOGIN',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          companyId,
          action: 'LOGIN_FAILED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.auditLog.count({
        where: { companyId, action: 'DELETE' },
      }),
      prisma.auditLog.count({
        where: { companyId, action: 'CREATE' },
      }),
      prisma.auditLog.count({
        where: { companyId, action: 'UPDATE' },
      }),
    ])

    return {
      totalActions,
      activeUsers: activeUsers.length,
      actionsToday,
      loginsToday,
      failedLogins,
      deletions,
      creations,
      updates,
    }
  }

  /**
   * Obtém timeline de uma entidade
   */
  static async getEntityTimeline(
    companyId: string,
    entity: string,
    entityId: string
  ) {
    const logs = await prisma.auditLog.findMany({
      where: {
        companyId,
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        action: true,
        userName: true,
        description: true,
        changedFields: true,
      },
    })

    return logs.map((log) => ({
      ...log,
      changedFields: log.changedFields ? JSON.parse(log.changedFields) : [],
    }))
  }
}
