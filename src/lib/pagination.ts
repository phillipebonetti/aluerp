/**
 * Pagination Utilities - Gerencia paginação eficientemente
 */

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export interface CursorPaginationResult<T> {
  data: T[]
  pagination: {
    cursor?: string
    hasNextPage: boolean
    limit: number
  }
}

/**
 * Calcula skip/take para offset pagination
 */
export function getPaginationOffsets(
  page: number,
  limit: number
): { skip: number; take: number } {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}

/**
 * Cria resultado paginado
 */
export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

/**
 * Calcula cursor para cursor-based pagination
 */
export function encodeCursor(id: string | number): string {
  return Buffer.from(id.toString()).toString('base64')
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8')
}

/**
 * Usa search params para paginação (client-side)
 */
export function getPaginationFromSearchParams(
  searchParams: Record<string, string | undefined>
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.limit || '20', 10))
  )
  return { page, limit }
}

/**
 * Cria URL com parâmetros de paginação
 */
export function createPaginationUrl(
  baseUrl: string,
  page: number,
  limit: number,
  additionalParams?: Record<string, string>
): string {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...additionalParams,
  })
  return `${baseUrl}?${params.toString()}`
}
