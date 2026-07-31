import { prisma } from '@/src/core/database'
import { headers } from 'next/headers'

interface AuditLogData {
  userId: string
  action: string // "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", etc
  resource: string // "clients", "projects", "financeiro", etc
  resourceId: string
  changes?: Record<string, any> // { before: {...}, after: {...} }
  ipAddress?: string
}

/**
 * Get client IP address from headers
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-client-ip') ||
    'unknown'
  )
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    const ipAddress = data.ipAddress || (await getClientIp())

    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress,
      },
    })

    return log
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw - audit logging should not break the main operation
    return null
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs({
  userId,
  resource,
  action,
  startDate,
  endDate,
  limit = 100,
  offset = 0,
}: {
  userId?: string
  resource?: string
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (userId) where.userId = userId
  if (resource) where.resource = resource
  if (action) where.action = action

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
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
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Audit helper for common operations
 */
export async function auditCreate(
  userId: string,
  resource: string,
  resourceId: string,
  data: Record<string, any>
) {
  return createAuditLog({
    userId,
    action: 'CREATE',
    resource,
    resourceId,
    changes: { after: data },
  })
}

export async function auditUpdate(
  userId: string,
  resource: string,
  resourceId: string,
  before: Record<string, any>,
  after: Record<string, any>
) {
  // Only log fields that changed
  const changes: Record<string, any> = {}
  let hasChanges = false

  for (const key in after) {
    if (before[key] !== after[key]) {
      if (!changes.fields) changes.fields = {}
      changes.fields[key] = { before: before[key], after: after[key] }
      hasChanges = true
    }
  }

  if (hasChanges) {
    return createAuditLog({
      userId,
      action: 'UPDATE',
      resource,
      resourceId,
      changes,
    })
  }
}

export async function auditDelete(
  userId: string,
  resource: string,
  resourceId: string,
  data: Record<string, any>
) {
  return createAuditLog({
    userId,
    action: 'DELETE',
    resource,
    resourceId,
    changes: { before: data },
  })
}

export async function auditLogin(
  userId: string,
  ipAddress?: string
) {
  return createAuditLog({
    userId,
    action: 'LOGIN',
    resource: 'AUTH',
    resourceId: userId,
    ipAddress,
  })
}

export async function auditLogout(
  userId: string,
  ipAddress?: string
) {
  return createAuditLog({
    userId,
    action: 'LOGOUT',
    resource: 'AUTH',
    resourceId: userId,
    ipAddress,
  })
}

export async function auditExport(
  userId: string,
  resource: string,
  format: string,
  filters?: Record<string, any>
) {
  return createAuditLog({
    userId,
    action: 'EXPORT',
    resource,
    resourceId: `export-${Date.now()}`,
    changes: { format, filters },
  })
}

export async function auditImport(
  userId: string,
  resource: string,
  fileName: string,
  importedCount: number
) {
  return createAuditLog({
    userId,
    action: 'IMPORT',
    resource,
    resourceId: `import-${Date.now()}`,
    changes: { fileName, importedCount },
  })
}
