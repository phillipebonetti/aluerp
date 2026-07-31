'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { Quote } from '@prisma/client'

interface QuoteFilters {
  search?: string
  status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  clientId?: string
  projectId?: string
  minValue?: number
  maxValue?: number
}

interface UseOrcamentosReturn {
  // Data
  orcamentos: Quote[]
  orcamento: Quote | null
  isLoading: boolean
  error: Error | null

  // Actions
  listar: (filters?: QuoteFilters) => Promise<void>
  obter: (id: string) => Promise<void>
  criar: (data: Partial<Quote>) => Promise<Quote | null>
  atualizar: (id: string, data: Partial<Quote>) => Promise<Quote | null>
  deletar: (id: string) => Promise<boolean>
  enviar: (id: string, email: string) => Promise<boolean>
  aceitar: (id: string) => Promise<boolean>
  rejeitar: (id: string) => Promise<boolean>
  converter: (id: string) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar orçamentos (quotes)
 * Integra com BudgetService via Server Actions
 * Fornece cache com ações de fluxo de trabalho
 */
export function useOrcamentos(): UseOrcamentosReturn {
  const [orcamentos, setOrcamentos] = useState<Quote[]>([])
  const [orcamento, setOrcamento] = useState<Quote | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<QuoteFilters>()

  // Busca lista de orçamentos com cache
  const { data: cachedQuotes, isLoading: loadingList, revalidate: revalidateCache } = useCache(
    `orcamentos:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/orcamentos', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar orçamentos')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 3 * 60 * 1000 } // 3 minutos
  )

  const listar = useCallback(async (newFilters?: QuoteFilters) => {
    setFilters(newFilters)
    setOrcamentos(cachedQuotes || [])
  }, [cachedQuotes])

  const obter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}`)
      if (!response.ok) throw new Error('Orçamento não encontrado')
      const data = await response.json()
      setOrcamento(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar orçamento')
      setError(error)
      setOrcamento(null)
    }
  }, [])

  const criar = useCallback(async (data: Partial<Quote>) => {
    try {
      setError(null)
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar orçamento')
      const newQuote = await response.json()
      setOrcamentos((prev) => [newQuote, ...prev])
      return newQuote
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar orçamento')
      setError(error)
      return null
    }
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<Quote>) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar orçamento')
      const updated = await response.json()
      setOrcamentos((prev) =>
        prev.map((q) => (q.id === id ? updated : q))
      )
      if (orcamento?.id === id) setOrcamento(updated)
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar orçamento')
      setError(error)
      return null
    }
  }, [orcamento?.id])

  const deletar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar orçamento')
      setOrcamentos((prev) => prev.filter((q) => q.id !== id))
      if (orcamento?.id === id) setOrcamento(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar orçamento')
      setError(error)
      return false
    }
  }, [orcamento?.id])

  const enviar = useCallback(async (id: string, email: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}/enviar`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error('Erro ao enviar orçamento')
      const updated = await response.json()
      setOrcamentos((prev) =>
        prev.map((q) => (q.id === id ? updated : q))
      )
      if (orcamento?.id === id) setOrcamento(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao enviar orçamento')
      setError(error)
      return false
    }
  }, [orcamento?.id])

  const aceitar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}/aceitar`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erro ao aceitar orçamento')
      const updated = await response.json()
      setOrcamentos((prev) =>
        prev.map((q) => (q.id === id ? updated : q))
      )
      if (orcamento?.id === id) setOrcamento(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao aceitar orçamento')
      setError(error)
      return false
    }
  }, [orcamento?.id])

  const rejeitar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}/rejeitar`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erro ao rejeitar orçamento')
      const updated = await response.json()
      setOrcamentos((prev) =>
        prev.map((q) => (q.id === id ? updated : q))
      )
      if (orcamento?.id === id) setOrcamento(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao rejeitar orçamento')
      setError(error)
      return false
    }
  }, [orcamento?.id])

  const converter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/orcamentos/${id}/converter`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erro ao converter orçamento')
      await revalidateCache()
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao converter orçamento')
      setError(error)
      return false
    }
  }, [revalidateCache])

  const revalidar = useCallback(async () => {
    await revalidateCache()
    await listar(filters)
  }, [revalidateCache, listar, filters])

  return {
    orcamentos: cachedQuotes || orcamentos,
    orcamento,
    isLoading: loadingList,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    enviar,
    aceitar,
    rejeitar,
    converter,
    revalidar,
  }
}
