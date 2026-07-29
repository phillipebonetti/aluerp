/**
 * Filter Utilities - Gerencia filtros avançados
 */

export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: any
}

export interface FilterGroup {
  logic: 'AND' | 'OR'
  conditions: FilterCondition[]
}

/**
 * Converte FilterCondition para cláusula Prisma WHERE
 */
export function filterConditionToPrisma(
  condition: FilterCondition
): Record<string, any> {
  const { field, operator, value } = condition

  const operators: Record<string, any> = {
    eq: value,
    ne: { not: value },
    gt: { gt: value },
    gte: { gte: value },
    lt: { lt: value },
    lte: { lte: value },
    in: { in: value },
    contains: { contains: value, mode: 'insensitive' },
  }

  return {
    [field]: operators[operator] || value,
  }
}

/**
 * Converte FilterGroup para Prisma WHERE
 */
export function filterGroupToPrisma(group: FilterGroup): Record<string, any> {
  const prismaConditions = group.conditions.map(filterConditionToPrisma)

  if (group.logic === 'AND') {
    return { AND: prismaConditions }
  } else {
    return { OR: prismaConditions }
  }
}

/**
 * Valida e sanitiza filtros
 */
export function sanitizeFilters(
  filters: Record<string, any>,
  allowedFields: string[]
): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(filters)) {
    if (allowedFields.includes(key) && value !== null && value !== undefined) {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Cria filtro dinâmico baseado em status
 */
export function createStatusFilter(
  statusField: string,
  statuses: string[]
): Record<string, any> {
  if (statuses.length === 0) return {}
  if (statuses.length === 1) return { [statusField]: statuses[0] }
  return { [statusField]: { in: statuses } }
}

/**
 * Cria filtro de data
 */
export function createDateRangeFilter(
  dateField: string,
  startDate?: Date,
  endDate?: Date
): Record<string, any> {
  const filter: Record<string, any> = {}

  if (startDate) {
    filter[dateField] = { gte: startDate }
  }

  if (endDate) {
    if (filter[dateField]) {
      filter[dateField].lte = endDate
    } else {
      filter[dateField] = { lte: endDate }
    }
  }

  return filter
}

/**
 * Cria filtro de range numérico
 */
export function createRangeFilter(
  field: string,
  min?: number,
  max?: number
): Record<string, any> {
  const filter: Record<string, any> = {}

  if (min !== undefined) {
    filter[field] = { gte: min }
  }

  if (max !== undefined) {
    if (filter[field]) {
      filter[field].lte = max
    } else {
      filter[field] = { lte: max }
    }
  }

  return filter
}

/**
 * Extrai filtros de search params
 */
export function extractFiltersFromSearchParams(
  searchParams: Record<string, string | undefined>,
  filterConfig: Record<string, 'string' | 'number' | 'date' | 'boolean'>
): Record<string, any> {
  const filters: Record<string, any> = {}

  for (const [key, type] of Object.entries(filterConfig)) {
    const value = searchParams[key]
    if (!value) continue

    switch (type) {
      case 'number':
        filters[key] = parseInt(value, 10)
        break
      case 'date':
        filters[key] = new Date(value)
        break
      case 'boolean':
        filters[key] = value === 'true'
        break
      case 'string':
      default:
        filters[key] = value
    }
  }

  return filters
}
