/**
 * useLazyLoad Hook - Lazy loading com Intersection Observer
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook para lazy loading com Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement>(
  callback: () => void,
  options: UseLazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          callback()

          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [callback, threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

/**
 * Hook para carregar lista com lazy loading
 */
export function useLazyLoadList<T>(
  items: T[],
  itemsPerPage: number = 20
) {
  const [displayedItems, setDisplayedItems] = useState<T[]>(
    items.slice(0, itemsPerPage)
  )
  const [page, setPage] = useState(1)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && displayedItems.length < items.length) {
        const nextPage = page + 1
        const newItems = items.slice(0, nextPage * itemsPerPage)
        setDisplayedItems(newItems)
        setPage(nextPage)
      }
    })

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [items, displayedItems.length, page, itemsPerPage])

  return {
    displayedItems,
    observerRef,
    hasMore: displayedItems.length < items.length,
    totalLoaded: displayedItems.length,
    totalItems: items.length,
  }
}

/**
 * Hook para infinite scroll
 */
export function useInfiniteScroll(
  callback: () => Promise<void>,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const { threshold = 0.5, rootMargin = '100px' } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (
          entry.isIntersecting &&
          !isLoading &&
          !loadingRef.current
        ) {
          loadingRef.current = true
          setIsLoading(true)

          try {
            await callback()
            setError(null)
          } catch (err) {
            setError(
              err instanceof Error ? err : new Error(String(err))
            )
          } finally {
            setIsLoading(false)
            loadingRef.current = false
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [callback, threshold, rootMargin])

  return { ref, isLoading, error }
}
