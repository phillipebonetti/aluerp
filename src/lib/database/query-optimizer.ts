/**
 * Query Optimizer - Otimiza e cacheia queries ao Supabase/Prisma
 * Reduz duplicação de queries e melhora performance
 */

interface QueryCache {
  data: any
  timestamp: number
  ttl: number
}

class QueryOptimizer {
  private cache = new Map<string, QueryCache>()
  private queryQueue: Array<{ key: string; query: () => Promise<any> }> = []
  private isProcessing = false
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutos

  /**
   * Gera chave de cache a partir de parametros
   */
  private generateCacheKey(
    namespace: string,
    params: Record<string, any>
  ): string {
    const sorted = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = params[key]
          return acc
        },
        {} as Record<string, any>
      )
    return `${namespace}:${JSON.stringify(sorted)}`
  }

  /**
   * Verifica se cache ainda é válido
   */
  private isCacheValid(cache: QueryCache): boolean {
    return Date.now() - cache.timestamp < cache.ttl
  }

  /**
   * Executa query com cache
   */
  async execute<T>(
    namespace: string,
    params: Record<string, any>,
    queryFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(namespace, params)

    // Verifica cache existente
    const cached = this.cache.get(cacheKey)
    if (cached && this.isCacheValid(cached)) {
      return cached.data as T
    }

    // Executa query
    const data = await queryFn()

    // Armazena no cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    return data
  }

  /**
   * Invalida cache para um namespace
   */
  invalidate(namespace: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.startsWith(namespace)
    )
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }

  /**
   * Batching de queries (deduplica requests simultâneos)
   */
  async batch<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    // Verifica se já existe query na fila
    const existing = this.queryQueue.find((q) => q.key === key)
    if (existing) {
      // Aguarda resultado da query em andamento
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const cached = this.cache.get(key)
          if (cached && this.isCacheValid(cached)) {
            clearInterval(checkInterval)
            resolve(cached.data as T)
          }
        }, 10)
      })
    }

    // Adiciona à fila
    this.queryQueue.push({ key, query: queryFn })
    this.processBatch()

    // Aguarda resultado
    while (!this.cache.get(key)) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    return this.cache.get(key)!.data as T
  }

  /**
   * Processa fila de queries em batch
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queryQueue.length === 0) return

    this.isProcessing = true
    const batch = this.queryQueue.splice(0, 10) // Processa 10 por vez

    await Promise.all(
      batch.map(async ({ key, query }) => {
        try {
          const data = await query()
          this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: this.defaultTTL,
          })
        } catch (error) {
          console.error(`[v0] Query failed: ${key}`, error)
        }
      })
    )

    this.isProcessing = false

    // Processa próximo batch se houver
    if (this.queryQueue.length > 0) {
      this.processBatch()
    }
  }
}

export const queryOptimizer = new QueryOptimizer()
