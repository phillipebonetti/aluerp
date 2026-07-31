'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { ServiceOrder } from '@prisma/client'

interface ServiceOrderFilters {
  search?: string
  status?: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  clientId?: string
  responsibleId?: string
  projectId?: string
}

interface UseOSReturn {
  // Data
  osOrders: ServiceOrder[]
  osOrder: ServiceOrder | null
  isLoading: boolean
  error: Error | null

  // Actions
  listar: (filters?: ServiceOrderFilters) => Promise<void>
  obter: (id: string) => Promise<void>
  criar: (data: Partial<ServiceOrder>) => Promise<ServiceOrder | null>
  atualizar: (id: string, data: Partial<ServiceOrder>) => Promise<ServiceOrder | null>
  deletar: (id: string) => Promise<boolean>
  atualizarStatus: (id: string, status: ServiceOrder['status']) => Promise<boolean>
  iniciar: (id: string) => Promise<boolean>
  concluir: (id: string, notes?: string) => Promise<boolean>
  cancelar: (id: string, reason?: string) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar ordens de serviço (OS)
 * Integra com OSService via Server Actions
 * Fornece cache com ações de fluxo de trabalho
 */
export function useOS(): UseOSReturn {
  const [osOrders, setOSOrders] = useState<ServiceOrder[]>([])
  const [osOrder, setOSOrder] = useState<ServiceOrder | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<ServiceOrderFilters>()

  // Busca lista de OS com cache
  const { data: cachedOrders, isLoading: loadingList, revalidate: revalidateCache } = useCache(
    `os:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/os', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar ordens de serviço')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 2 * 60 * 1000 } // 2 minutos - OS é crítico, atualização frequente
  )

  const listar = useCallback(async (newFilters?: ServiceOrderFilters) => {
    setFilters(newFilters)
    setOSOrders(cachedOrders || [])
  }, [cachedOrders])

  const obter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}`)
      if (!response.ok) throw new Error('Ordem de serviço não encontrada')
      const data = await response.json()
      setOSOrder(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar ordem de serviço')
      setError(error)
      setOSOrder(null)
    }
  }, [])

  const criar = useCallback(async (data: Partial<ServiceOrder>) => {
    try {
      setError(null)
      const response = await fetch('/api/os', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar ordem de serviço')
      const newOS = await response.json()
      setOSOrders((prev) => [newOS, ...prev])
      return newOS
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar ordem de serviço')
      setError(error)
      return null
    }
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<ServiceOrder>) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar ordem de serviço')
      const updated = await response.json()
      setOSOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
      if (osOrder?.id === id) setOSOrder(updated)
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar ordem de serviço')
      setError(error)
      return null
    }
  }, [osOrder?.id])

  const deletar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar ordem de serviço')
      setOSOrders((prev) => prev.filter((o) => o.id !== id))
      if (osOrder?.id === id) setOSOrder(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar ordem de serviço')
      setError(error)
      return false
    }
  }, [osOrder?.id])

  const atualizarStatus = useCallback(async (id: string, status: ServiceOrder['status']) => {
    try {
      const result = await atualizar(id, { status })
      return result !== null
    } catch {
      return false
    }
  }, [atualizar])

  const iniciar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}/iniciar`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erro ao iniciar ordem de serviço')
      const updated = await response.json()
      setOSOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
      if (osOrder?.id === id) setOSOrder(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao iniciar ordem de serviço')
      setError(error)
      return false
    }
  }, [osOrder?.id])

  const concluir = useCallback(async (id: string, notes?: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}/concluir`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      })
      if (!response.ok) throw new Error('Erro ao concluir ordem de serviço')
      const updated = await response.json()
      setOSOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
      if (osOrder?.id === id) setOSOrder(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao concluir ordem de serviço')
      setError(error)
      return false
    }
  }, [osOrder?.id])

  const cancelar = useCallback(async (id: string, reason?: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/os/${id}/cancelar`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      if (!response.ok) throw new Error('Erro ao cancelar ordem de serviço')
      const updated = await response.json()
      setOSOrders((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
      if (osOrder?.id === id) setOSOrder(updated)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao cancelar ordem de serviço')
      setError(error)
      return false
    }
  }, [osOrder?.id])

  const revalidar = useCallback(async () => {
    await revalidateCache()
    await listar(filters)
  }, [revalidateCache, listar, filters])

  return {
    osOrders: cachedOrders || osOrders,
    osOrder,
    isLoading: loadingList,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    atualizarStatus,
    iniciar,
    concluir,
    cancelar,
    revalidar,
  }
}
