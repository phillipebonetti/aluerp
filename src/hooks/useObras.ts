'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { Project } from '@prisma/client'

interface ProjectFilters {
  search?: string
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  clientId?: string
  responsibleId?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface UseObrasReturn {
  // Data
  obras: Project[]
  obra: Project | null
  isLoading: boolean
  error: Error | null

  // Actions
  listar: (filters?: ProjectFilters) => Promise<void>
  obter: (id: string) => Promise<void>
  criar: (data: Partial<Project>) => Promise<Project | null>
  atualizar: (id: string, data: Partial<Project>) => Promise<Project | null>
  deletar: (id: string) => Promise<boolean>
  atualizarStatus: (id: string, status: Project['status']) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar obras (projetos)
 * Integra com ProjectService via Server Actions
 * Fornece cache automático com revalidação por status
 */
export function useObras(): UseObrasReturn {
  const [obras, setObras] = useState<Project[]>([])
  const [obra, setObra] = useState<Project | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<ProjectFilters>()

  // Busca lista de obras com cache por filtros
  const { data: cachedObras, isLoading: loadingList, revalidate: revalidateCache } = useCache(
    `obras:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/obras', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar obras')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 3 * 60 * 1000 } // 3 minutos - atualização mais frequente que clientes
  )

  const listar = useCallback(async (newFilters?: ProjectFilters) => {
    setFilters(newFilters)
    setObras(cachedObras || [])
  }, [cachedObras])

  const obter = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/obras/${id}`)
      if (!response.ok) throw new Error('Obra não encontrada')
      const data = await response.json()
      setObra(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar obra')
      setError(error)
      setObra(null)
    }
  }, [])

  const criar = useCallback(async (data: Partial<Project>) => {
    try {
      setError(null)
      const response = await fetch('/api/obras', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar obra')
      const newObra = await response.json()
      setObras((prev) => [newObra, ...prev])
      return newObra
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar obra')
      setError(error)
      return null
    }
  }, [])

  const atualizar = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      setError(null)
      const response = await fetch(`/api/obras/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar obra')
      const updated = await response.json()
      setObras((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
      if (obra?.id === id) setObra(updated)
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar obra')
      setError(error)
      return null
    }
  }, [obra?.id])

  const deletar = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/obras/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar obra')
      setObras((prev) => prev.filter((o) => o.id !== id))
      if (obra?.id === id) setObra(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar obra')
      setError(error)
      return false
    }
  }, [obra?.id])

  const atualizarStatus = useCallback(async (id: string, status: Project['status']) => {
    try {
      const result = await atualizar(id, { status })
      return result !== null
    } catch {
      return false
    }
  }, [atualizar])

  const revalidar = useCallback(async () => {
    await revalidateCache()
    await listar(filters)
  }, [revalidateCache, listar, filters])

  return {
    obras: cachedObras || obras,
    obra,
    isLoading: loadingList,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    atualizarStatus,
    revalidar,
  }
}
