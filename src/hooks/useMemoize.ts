/**
 * useMemoize Hook - Memoiza computações pesadas
 */

'use client'

import { useMemo, useCallback, useRef } from 'react'

/**
 * Hook para memoizar resultado de computação pesada
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList,
  { size = 10 } = {}
): T {
  const cacheRef = useRef<Map<string, T>>(new Map())

  return useMemo(() => {
    const key = JSON.stringify(deps)
    const cached = cacheRef.current.get(key)

    if (cached) {
      return cached
    }

    const result = factory()

    // Limita tamanho do cache
    if (cacheRef.current.size >= size) {
      const firstKey = cacheRef.current.keys().next().value
      cacheRef.current.delete(firstKey)
    }

    cacheRef.current.set(key, result)
    return result
  }, deps)
}

/**
 * Hook para memoizar função
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const resultRef = useRef(callback)

  return useCallback(
    ((...args: any[]) => resultRef.current(...args)) as T,
    deps
  )
}

/**
 * Hook para filtro memoizado
 */
export function useMemoizedFilter<T>(
  items: T[],
  predicate: (item: T) => boolean,
  deps: React.DependencyList
): T[] {
  return useMemo(() => {
    return items.filter(predicate)
  }, [items, ...deps])
}

/**
 * Hook para map memoizado
 */
export function useMemoizedMap<T, U>(
  items: T[],
  mapper: (item: T) => U,
  deps: React.DependencyList
): U[] {
  return useMemo(() => {
    return items.map(mapper)
  }, [items, ...deps])
}

/**
 * Hook para sort memoizado
 */
export function useMemoizedSort<T>(
  items: T[],
  compareFn: (a: T, b: T) => number,
  deps: React.DependencyList
): T[] {
  return useMemo(() => {
    return [...items].sort(compareFn)
  }, [items, ...deps])
}

/**
 * Hook para computação com múltiplas etapas
 */
export function useMemoizedPipeline<T>(
  input: T,
  pipeline: Array<(data: T) => T>,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    return pipeline.reduce((acc, fn) => fn(acc), input)
  }, [input, ...deps])
}
