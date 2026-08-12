/**
 * Lazy Loading and Code Splitting Utilities
 * Otimização de carregamento de componentes e modules
 */

import { ComponentType, ReactNode } from 'react'

export interface LazyLoadConfig {
  fallback?: ReactNode
  ssr?: boolean
  loading?: () => ReactNode
}

/**
 * Padrões de lazy loading para diferentes tipos de componentes
 */
export const lazyLoadingPatterns = {
  // Heavy components que só aparecem em rotas específicas
  chartDashboard: {
    ssr: false,
    fallback: 'Carregando gráficos...',
  },

  // Modals e drawers - carregamento sob demanda
  modal: {
    ssr: false,
    fallback: 'Carregando...',
  },

  // Galeria de imagens - lazy load por viewport
  gallery: {
    ssr: false,
    fallback: 'Carregando galeria...',
  },

  // Editores WYSIWYG - heavy libraries
  editor: {
    ssr: false,
    fallback: 'Carregando editor...',
  },

  // Tabelas virtualizadas com muitos dados
  virtualTable: {
    ssr: false,
    fallback: 'Carregando tabela...',
  },

  // Mapa interativo
  map: {
    ssr: false,
    fallback: 'Carregando mapa...',
  },
}

/**
 * Skeleton loading component generator
 */
export function createSkeleton(lines: number = 3): ReactNode {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  )
}

/**
 * Detecção de IntersectionObserver para lazy load por viewport
 */
export function useIntersectionLoad(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
): void {
  // Hook para usar em componentes
  // Implementar no lado do cliente
}

/**
 * Preload de recursos críticos
 */
export class ResourcePreloader {
  /**
   * Preload de próxima página/rota frequentemente acessada
   */
  static preloadRoute(href: string): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    }
  }

  /**
   * Preload de imagens
   */
  static preloadImages(urls: string[]): void {
    if (typeof window !== 'undefined') {
      urls.forEach((url) => {
        const img = new Image()
        img.src = url
      })
    }
  }

  /**
   * Preload de dados críticos (KPIs, dashboard)
   */
  static async preloadCriticalData(endpoints: string[]): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, { 
            headers: { 'X-Priority': 'high' }
          }).catch(() => {
            // Falha silenciosa em preload
          })
        )
      )
    } catch (error) {
      console.warn('[Preload] Failed to preload critical data', error)
    }
  }
}

/**
 * Code splitting por rota
 */
export const routeCodeSplitting = {
  // Páginas que devem ser lazy loaded
  heavyPages: ['/relatorios', '/analises', '/graficos', '/importacao'],

  // Modais que devem ser lazy loaded
  heavyModals: ['ConfigModal', 'GenerateReportModal', 'ImportModal'],

  // Componentes que devem ser lazy loaded
  heavyComponents: ['ChartComponent', 'DataGridComponent', 'MapComponent'],
}

/**
 * Bundle size optimization recommendations
 */
export const bundleOptimizations = {
  // Remover dependências não utilizadas
  unusedDependencies: [
    // Adicionar conforme diagnóstico
  ],

  // Alternativas mais leves
  heavyDependencies: {
    moment: 'dayjs', // 67KB vs 2KB
    lodash: 'lodash-es', // 71KB vs ~25KB com tree-shaking
    'date-fns': 'dayjs', // Se apenas parsing básico
  },

  // Dinâmicos vs estáticos
  dynamicImports: {
    charts: 'dynamic(() => import("@/components/charts"))',
    editors: 'dynamic(() => import("@/components/editors"))',
    maps: 'dynamic(() => import("@/components/maps"))',
  },
}

/**
 * Module Federation para compartilhamento de código entre aplicações
 */
export const moduleFederationConfig = {
  // Componentes compartilhados entre portal e admin
  sharedComponents: [
    'ui/button',
    'ui/card',
    'ui/modal',
    'ui/table',
  ],

  // Utils compartilhadas
  sharedUtils: [
    'lib/helpers',
    'lib/formatting',
    'lib/validation',
  ],
}

/**
 * Measure performance de lazy loading
 */
export class LazyLoadMetrics {
  static measureComponentLoadTime(componentName: string, startTime: number): void {
    const duration = Date.now() - startTime
    const threshold = 1000 // 1 segundo

    if (duration > threshold) {
      console.warn(
        `[Performance] Component "${componentName}" levou ${duration}ms para carregar (limiar: ${threshold}ms)`
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Lazy Load] ${componentName}: ${duration}ms`)
    }
  }

  static reportLoadingMetrics(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Performance] ${entry.name}: ${entry.duration}ms`)
        }
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }
}
