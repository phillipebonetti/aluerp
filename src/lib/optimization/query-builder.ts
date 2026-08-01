/**
 * Query Optimization Layer
 * Implementa paginação, seleção de campos e prevenção de N+1 queries
 */

import { Prisma } from '@prisma/client'

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface QueryOptions<T> {
  pagination?: PaginationParams
  select?: Prisma.Subset<T, any>
  where?: any
  orderBy?: any
  include?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Normaliza parâmetros de paginação
 */
export function normalizePagination(params?: PaginationParams) {
  const limit = Math.min(params?.limit || 10, 100) // Max 100 por página
  const page = Math.max(params?.page || 1, 1)
  const offset = params?.offset || (page - 1) * limit

  return { limit, page, offset }
}

/**
 * Seleciona apenas campos necessários para reduzir payload
 */
export function selectOptimalFields<T>(model: string, includeRelations = false): Partial<Record<keyof T, boolean>> {
  const fieldSelections: Record<string, any> = {
    works: {
      id: true,
      title: true,
      status: true,
      value: true,
      startDate: true,
      endDate: true,
      progress: true,
      companyId: true,
      // Omitir: description, notes, etc
    },
    clients: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      companyId: true,
      // Omitir: address, metadata, etc
    },
    payments: {
      id: true,
      amount: true,
      status: true,
      dueDate: true,
      paidDate: true,
      method: true,
      workId: true,
      // Omitir: notes, metadata, etc
    },
    products: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      category: true,
      // Omitir: description, specifications, etc
    },
  }

  return fieldSelections[model] || {}
}

/**
 * Recomenda índices para queries frequentes
 */
export const recommendedIndexes = [
  // Works
  'CREATE INDEX IF NOT EXISTS idx_works_company_status ON works(companyId, status)',
  'CREATE INDEX IF NOT EXISTS idx_works_status_date ON works(status, startDate)',

  // Clients
  'CREATE INDEX IF NOT EXISTS idx_clients_company_status ON clients(companyId, status)',
  'CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)',

  // Payments
  'CREATE INDEX IF NOT EXISTS idx_payments_work_status ON payments(workId, status)',
  'CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(dueDate)',

  // Messages
  'CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON ai_messages(conversationId, createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_status ON whatsapp_messages(phoneNumber, status)',

  // Logs
  'CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(integrationId, createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_company_created ON ai_usage_logs(companyId, createdAt)',
]

/**
 * Identifica potenciais queries N+1
 */
export function detectN1Patterns(queryName: string, isIncludingRelations: boolean): void {
  if (process.env.NODE_ENV === 'development') {
    if (!isIncludingRelations && queryName.match(/list|find/i)) {
      console.warn(`[Performance] Possível N+1 pattern em "${queryName}". Considere usar include/select.`)
    }
  }
}

/**
 * Log de performance de query
 */
export class QueryPerformanceLogger {
  private startTime: number = 0

  start(): void {
    this.startTime = Date.now()
  }

  end(queryName: string, duration?: number): void {
    const elapsed = duration || Date.now() - this.startTime
    const threshold = 100 // ms

    if (elapsed > threshold) {
      console.warn(`[Performance] Query "${queryName}" levou ${elapsed}ms (limiar: ${threshold}ms)`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Query] ${queryName}: ${elapsed}ms`)
    }
  }
}

/**
 * Builder para queries otimizadas
 */
export class OptimizedQueryBuilder<T> {
  private params: QueryOptions<T> = {}

  withPagination(page: number = 1, limit: number = 10): this {
    this.params.pagination = normalizePagination({ page, limit })
    return this
  }

  withSelect(select: any): this {
    this.params.select = select
    return this
  }

  withWhere(where: any): this {
    this.params.where = where
    return this
  }

  withOrderBy(orderBy: any): this {
    this.params.orderBy = orderBy
    return this
  }

  withInclude(include: any): this {
    this.params.include = include
    return this
  }

  build(): QueryOptions<T> {
    return this.params
  }
}

/**
 * Exemplo de uso:
 * 
 * const options = new OptimizedQueryBuilder()
 *   .withPagination(1, 20)
 *   .withSelect({ id: true, name: true, email: true })
 *   .withWhere({ status: 'ACTIVE' })
 *   .withOrderBy({ createdAt: 'desc' })
 *   .build()
 *
 * const result = await db.client.findMany(options)
 */
