'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { Client } from '@prisma/client'

interface ClientFilters {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
  category?: string
  city?: string
}

interface UseClientesReturn {
  // Data
  clientes: Client[]
  cliente: Client | null
  isLoading: boolean
  error: Error | null

  // Actions
  listar: (filters?: ClientFilters) => Promise<void>
  obter: (id: string) => Promise<void>
  criar: (data: Partial<Client>) => Promise<Client | null>
  atualizar: (id: string, data: Partial<Client>) => Promise<Client | null>
  deletar: (id: string) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar clientes
 * Integra com ClientService via Server Actions
 * Fornece cache automático e error handling
 */
export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Client[]>([])
  const [cliente, setCliente] = useState<Client | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<ClientFilters>()

  // Busca lista de clientes com cache
  const { data: cachedClientes, isLoading: loadingList } = useCache(
    `clientes:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/clientes', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar clientes')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 5 * 60 * 1000 } // 5 minutos
  )

  const listar = useCallback(async (newFilters?: ClientFilters) => {
    setFilters(newFilters)
    setClientes(cachedClientes || [])
  }, [cachedClientes])

  const obter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/clientes/${id}`)
      if (!response.ok) throw new Error('Cliente não encontrado')
      const data = await response.json()
      setCliente(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar cliente')
      setError(error)
      setCliente(null)
    }
  }, [])

  const criar = useCallback(async (data: Partial<Client>) => {
    try {
      setError(null)
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar cliente')
      const newCliente = await response.json()
      setClientes((prev) => [newCliente, ...prev])
      return newCliente
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar cliente')
      setError(error)
      return null
    }
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<Client>) => {
    try {
      setError(null)
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar cliente')
      const updated = await response.json()
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      )
      if (cliente?.id === id) setCliente(updated)
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar cliente')
      setError(error)
      return null
    }
  }, [cliente?.id])

  const deletar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar cliente')
      setClientes((prev) => prev.filter((c) => c.id !== id))
      if (cliente?.id === id) setCliente(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar cliente')
      setError(error)
      return false
    }
  }, [cliente?.id])

  const revalidar = useCallback(async () => {
    await listar(filters)
  }, [listar, filters])

  return {
    clientes: cachedClientes || clientes,
    cliente,
    isLoading: loadingList,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    revalidar,
  }
}
