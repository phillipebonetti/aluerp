import { prisma } from '@/lib/prisma'
import type { RepositoryOptions } from '@/src/repositories'

export interface AuditLogEntry {
  userId: string
  companyId: string
  action: string
  resource: string
  resourceId: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'SUCCESS' | 'FAILED'
}

export class AuditService {
  /**
   * Registra uma ação no histórico de auditoria
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          changes: entry.changes ? JSON.stringify(entry.changes) : null,
          ipAddress: entry.ipAddress,
        },
      })
    } catch (error) {
      console.error('[v0] Failed to log audit entry:', error)
    }
  }

  /**
   * Recupera histórico de auditoria
   */
  async getAuditHistory(options: {
    companyId: string
    resource?: string
    userId?: string
    limit?: number
    offset?: number
  }): Promise<any[]> {
    const { limit = 50, offset = 0 } = options

    return prisma.auditLog.findMany({
      where: {
        ...(options.resource && { resource: options.resource }),
        ...(options.userId && { userId: options.userId }),
        user: {
          memberships: {
            some: {
              companyId: options.companyId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Recupera histórico de um recurso específico
   */
  async getResourceHistory(
    companyId: string,
    resource: string,
    resourceId: string
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
        user: {
          memberships: {
            some: {
              companyId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Recupera atividades por usuário
   */
  async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Calcula estatísticas de auditoria
   */
  async getAuditStats(companyId: string): Promise<any> {
    const totalLogs = await prisma.auditLog.count({
      where: {
        user: {
          memberships: {
            some: {
              companyId,
            },
          },
        },
      },
    })

    const resourceCount = await prisma.auditLog.groupBy({
      by: ['resource'],
      where: {
        user: {
          memberships: {
            some: {
              companyId,
            },
          },
        },
      },
      _count: true,
    })

    const userCount = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        user: {
          memberships: {
            some: {
              companyId,
            },
          },
        },
      },
      _count: true,
    })

    return {
      totalLogs,
      resourceBreakdown: resourceCount,
      topUsers: userCount
        .sort((a, b) => b._count - a._count)
        .slice(0, 5),
    }
  }

  /**
   * Exporta auditoria para análise
   */
  async exportAuditLogs(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: {
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
        user: {
          memberships: {
            some: {
              companyId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
