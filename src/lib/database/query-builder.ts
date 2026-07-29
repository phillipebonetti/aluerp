/**
 * Query Builder - Constrói queries otimizadas para Prisma
 * Suporta select seletivo, includes dinâmicos, filtros avançados
 */

interface QueryOptions<T> {
  select?: Partial<Record<keyof T, boolean | any>>
  include?: Record<string, any>
  where?: Record<string, any>
  orderBy?: Record<string, 'asc' | 'desc'>
  pagination?: {
    page: number
    limit: number
  }
  search?: {
    fields: (keyof T)[]
    query: string
  }
}

export class QueryBuilder<T> {
  private options: QueryOptions<T> = {}

  /**
   * Define colunas a retornar (otimiza banda)
   */
  select(fields: Partial<Record<keyof T, boolean>>): this {
    this.options.select = fields
    return this
  }

  /**
   * Define relacionamentos para incluir
   */
  include(relations: Record<string, any>): this {
    this.options.include = relations
    return this
  }

  /**
   * Define filtros WHERE
   */
  where(conditions: Record<string, any>): this {
    this.options.where = { ...this.options.where, ...conditions }
    return this
  }

  /**
   * Define ordenação
   */
  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
    this.options.orderBy = { [field]: direction }
    return this
  }

  /**
   * Define paginação
   */
  paginate(page: number, limit: number = 20): this {
    this.options.pagination = { page, limit }
    return this
  }

  /**
   * Busca full-text em múltiplos campos
   */
  search(query: string, fields: (keyof T)[]): this {
    this.options.search = { query, fields }
    return this
  }

  /**
   * Constrói filtro de busca
   */
  private buildSearchFilter(): Record<string, any> {
    if (!this.options.search) return {}

    const { query, fields } = this.options.search
    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: query,
          mode: 'insensitive',
        },
      })),
    }
  }

  /**
   * Constrói objeto de skip/take para paginação
   */
  private buildPagination(): { skip?: number; take?: number } {
    if (!this.options.pagination) return {}

    const { page, limit } = this.options.pagination
    return {
      skip: (page - 1) * limit,
      take: limit,
    }
  }

  /**
   * Retorna query completa para Prisma
   */
  build(): Record<string, any> {
    const query: Record<string, any> = {}

    // Adiciona select
    if (this.options.select) {
      query.select = this.options.select
    }

    // Adiciona includes
    if (this.options.include) {
      query.include = this.options.include
    }

    // Constrói where com filtros + busca
    const where: Record<string, any> = { ...this.options.where }
    const searchFilter = this.buildSearchFilter()
    if (Object.keys(searchFilter).length > 0) {
      where.AND = [where, searchFilter]
    }
    if (Object.keys(where).length > 0) {
      query.where = where
    }

    // Adiciona orderBy
    if (this.options.orderBy) {
      query.orderBy = this.options.orderBy
    }

    // Adiciona paginação
    const pagination = this.buildPagination()
    if (Object.keys(pagination).length > 0) {
      query.skip = pagination.skip
      query.take = pagination.take
    }

    return query
  }

  /**
   * Reseta builder
   */
  reset(): this {
    this.options = {}
    return this
  }
}
