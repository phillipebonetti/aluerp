/**
 * useCache Hook - Cacheia dados com expiração automática
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const globalCache = new Map<string, CacheEntry<any>>()

/**
 * Hook para cachear dados
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; revalidateOnFocus?: boolean } = {}
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  revalidate: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { ttl = 5 * 60 * 1000, revalidateOnFocus = true } = options
  const hasFetched = useRef(false)

  const isCacheValid = useCallback(() => {
    const cached = globalCache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < cached.ttl
  }, [key])

  const revalidate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setData(result)
      globalCache.set(key, { data: result, timestamp: Date.now(), ttl })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttl])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    // Verifica cache
    if (isCacheValid()) {
      const cached = globalCache.get(key)
      if (cached) {
        setData(cached.data)
        setIsLoading(false)
        return
      }
    }

    // Busca dados
    revalidate()
  }, [key, isCacheValid, revalidate])

  // Revalidate ao receber foco
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (!isCacheValid()) {
        revalidate()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, isCacheValid, revalidate])

  return { data, isLoading, error, revalidate }
}

/**
 * Hook para cachear múltiplas queries relacionadas
 */
export function useMultiCache<T extends Record<string, any>>(
  queries: Record<keyof T, () => Promise<T[keyof T]>>,
  options: { ttl?: number } = {}
): {
  data: Partial<T> | null
  isLoading: boolean
  error: Error | null
  revalidate: (key?: keyof T) => Promise<void>
} {
  const [data, setData] = useState<Partial<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { ttl = 5 * 60 * 1000 } = options
  const hasFetched = useRef(false)

  const revalidate = useCallback(
    async (key?: keyof T) => {
      setIsLoading(true)
      setError(null)

      try {
        const keys = key ? [key] : (Object.keys(queries) as (keyof T)[])
        const results: Partial<T> = {}

        await Promise.all(
          keys.map(async (k) => {
            const result = await queries[k]()
            results[k] = result
            globalCache.set(String(k), {
              data: result,
              timestamp: Date.now(),
              ttl,
            })
          })
        )

        setData((prev) => ({ ...prev, ...results }))
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    },
    [queries, ttl]
  )

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    revalidate()
  }, [revalidate])

  return { data, isLoading, error, revalidate }
}

/**
 * Limpa cache global
 */
export function clearCache(key?: string): void {
  if (key) {
    globalCache.delete(key)
  } else {
    globalCache.clear()
  }
}

/**
 * Retorna tamanho do cache
 */
export function getCacheSize(): number {
  return globalCache.size
}
