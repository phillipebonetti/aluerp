/**
 * Virtual List Hook
 * Otimização para renderizar listas grandes com apenas itens visíveis
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export interface VirtualizationConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number // Itens extras acima/abaixo do viewport para scroll suave
  buffer?: number // Espaço em branco adicional
}

export interface VirtualizedRange {
  start: number
  end: number
  offset: number
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [range, setRange] = useState<VirtualizedRange>({
    start: 0,
    end: Math.ceil(config.containerHeight / config.itemHeight),
    offset: 0,
  })

  const overscan = config.overscan || 3
  const totalHeight = items.length * config.itemHeight

  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement
      const newScrollTop = target.scrollTop

      setScrollTop(newScrollTop)

      const start = Math.max(0, Math.floor(newScrollTop / config.itemHeight) - overscan)
      const end = Math.min(
        items.length,
        Math.ceil((newScrollTop + config.containerHeight) / config.itemHeight) + overscan
      )

      const offset = start * config.itemHeight

      setRange({ start, end, offset })
    },
    [config.containerHeight, config.itemHeight, items.length, overscan]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Retornar configuração para o container
  const containerProps = {
    ref: containerRef,
    style: {
      height: config.containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
  }

  // Retornar itens visíveis
  const visibleItems = items.slice(range.start, range.end)

  // Retornar configuração para o wrapper
  const wrapperProps = {
    style: {
      height: totalHeight,
      position: 'relative' as const,
    },
  }

  // Retornar configuração para os itens
  const itemProps = (index: number) => ({
    style: {
      transform: `translateY(${(range.start + index) * config.itemHeight}px)`,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: config.itemHeight,
    },
  })

  return {
    containerProps,
    wrapperProps,
    itemProps,
    visibleItems,
    visibleRange: range,
    scrollTop,
  }
}

/**
 * Hook alternativo com estrutura mais simples (usando transform)
 */
export function useSimpleVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    offset: (startIndex + index) * itemHeight,
  }))

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    range: { start: startIndex, end: endIndex },
  }
}

/**
 * Hook para infinite scroll (lazy load ao chegar no fim)
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  threshold = 200
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = async () => {
      const { scrollTop, scrollHeight, clientHeight } = container

      // Se chegou perto do fim, carregar mais
      if (scrollHeight - (scrollTop + clientHeight) < threshold && !isLoading) {
        setIsLoading(true)
        await onLoadMore()
        setIsLoading(false)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [onLoadMore, threshold, isLoading])

  return {
    ref: containerRef,
    isLoading,
  }
}

/**
 * Exemplo de uso:
 * 
 * function VirtualizedList({ items }) {
 *   const { containerProps, wrapperProps, itemProps, visibleItems, visibleRange } = useVirtualization(
 *     items,
 *     {
 *       itemHeight: 50,
 *       containerHeight: 400,
 *       overscan: 5,
 *     }
 *   )
 *
 *   return (
 *     <div {...containerProps}>
 *       <div {...wrapperProps}>
 *         {visibleItems.map((item, index) => (
 *           <div key={visibleRange.start + index} {...itemProps(index)}>
 *             {item.name}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   )
 * }
 */
