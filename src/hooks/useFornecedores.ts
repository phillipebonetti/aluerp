'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { Supplier } from '@prisma/client'

interface SupplierFilters {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  category?: string
  city?: string
  rating?: number
}

interface UseForncedoresReturn {
  // Data
  fornecedores: Supplier[]
  fornecedor: Supplier | null
  isLoading: boolean
  error: Error | null

  // Actions
  listar: (filters?: SupplierFilters) => Promise<void>
  obter: (id: string) => Promise<void>
  criar: (data: Partial<Supplier>) => Promise<Supplier | null>
  atualizar: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>
  deletar: (id: string) => Promise<boolean>
  avaliar: (id: string, rating: number, comment?: string) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar fornecedores
 * Integra com SupplierService via Server Actions
 * Fornece cache com rating e avaliações
 */
export function useFornecedores(): UseForncedoresReturn {
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])
  const [fornecedor, setFornecedor] = useState<Supplier | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<SupplierFilters>()

  // Busca lista de fornecedores com cache
  const { data: cachedSuppliers, isLoading: loadingList, revalidate: revalidateCache } = useCache(
    `fornecedores:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/fornecedores', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar fornecedores')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 5 * 60 * 1000 } // 5 minutos
  )

  const listar = useCallback(async (newFilters?: SupplierFilters) => {
    setFilters(newFilters)
    setFornecedores(cachedSuppliers || [])
  }, [cachedSuppliers])

  const obter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/fornecedores/${id}`)
      if (!response.ok) throw new Error('Fornecedor não encontrado')
      const data = await response.json()
      setFornecedor(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar fornecedor')
      setError(error)
      setFornecedor(null)
    }
  }, [])

  const criar = useCallback(async (data: Partial<Supplier>) => {
    try {
      setError(null)
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar fornecedor')
      const newSupplier = await response.json()
      setFornecedores((prev) => [newSupplier, ...prev])
      return newSupplier
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar fornecedor')
      setError(error)
      return null
    }
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<Supplier>) => {
    try {
      setError(null)
      const response = await fetch(`/api/fornecedores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar fornecedor')
      const updated = await response.json()
      setFornecedores((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
      if (fornecedor?.id === id) setFornecedor(updated)
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar fornecedor')
      setError(error)
      return null
    }
  }, [fornecedor?.id])

  const deletar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/fornecedores/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar fornecedor')
      setFornecedores((prev) => prev.filter((s) => s.id !== id))
      if (fornecedor?.id === id) setFornecedor(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar fornecedor')
      setError(error)
      return false
    }
  }, [fornecedor?.id])

  const avaliar = useCallback(async (id: string, rating: number, comment?: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/fornecedores/${id}/avaliar`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      })
      if (!response.ok) throw new Error('Erro ao avaliar fornecedor')
      const updated = await response.json()
      setFornecedores((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
      if (fornecedor?.id === id) setFornecedor(updated)
      // Revalidar cache após avaliação
      await revalidateCache()
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao avaliar fornecedor')
      setError(error)
      return false
    }
  }, [fornecedor?.id, revalidateCache])

  const revalidar = useCallback(async () => {
    await revalidateCache()
    await listar(filters)
  }, [revalidateCache, listar, filters])

  return {
    fornecedores: cachedSuppliers || fornecedores,
    fornecedor,
    isLoading: loadingList,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    avaliar,
    revalidar,
  }
}
