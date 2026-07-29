/**
 * Batch Query Handler - Agrupa múltiplas queries relacionadas
 * Reduz chamadas duplicadas ao banco
 */

interface BatchQuery {
  id: string
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (reason: any) => void
}

export class BatchQueryHandler {
  private queue: Map<string, BatchQuery> = new Map()
  private processing = false
  private readonly batchSize = 10
  private readonly flushInterval = 5 // ms

  /**
   * Agenda query para execução em batch
   */
  async queue<T>(id: string, queryFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.set(id, {
        id,
        execute: queryFn,
        resolve,
        reject,
      })

      // Inicia processamento se não estiver rodando
      if (!this.processing) {
        this.processBatch()
      }
    })
  }

  /**
   * Processa fila de queries
   */
  private async processBatch(): Promise<void> {
    if (this.processing) return

    this.processing = true

    while (this.queue.size > 0) {
      // Aguarda um pouco para acumular mais queries
      await new Promise((resolve) =>
        setTimeout(resolve, this.flushInterval)
      )

      // Extrai batch
      const batch = Array.from(this.queue.values()).slice(
        0,
        this.batchSize
      )
      if (batch.length === 0) break

      // Executa em paralelo
      await Promise.all(
        batch.map(async (query) => {
          try {
            this.queue.delete(query.id)
            const result = await query.execute()
            query.resolve(result)
          } catch (error) {
            this.queue.delete(query.id)
            query.reject(error)
          }
        })
      )
    }

    this.processing = false
  }

  /**
   * Força processamento imediato
   */
  async flush(): Promise<void> {
    while (this.queue.size > 0) {
      await this.processBatch()
    }
  }

  /**
   * Limpa fila
   */
  clear(): void {
    this.queue.clear()
  }

  /**
   * Status da fila
   */
  getSize(): number {
    return this.queue.size
  }
}

export const batchQueryHandler = new BatchQueryHandler()
