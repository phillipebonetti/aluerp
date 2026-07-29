/**
 * Suspense Boundary - Error boundary com Suspense integrado
 */

'use client'

import { ReactNode, Suspense, Component, ReactElement } from 'react'

interface SuspenseBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
}

interface State {
  error: Error | null
}

/**
 * Error Boundary para capturar erros
 */
class ErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void; retry: () => void },
  State
> {
  constructor(props: any) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[v0] Error caught:', error)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm font-medium text-destructive">
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null })
              this.props.retry()
            }}
            className="mt-2 px-3 py-1.5 bg-destructive text-white text-xs rounded hover:bg-destructive/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Componente Suspense Boundary
 */
export function SuspenseBoundary({
  children,
  fallback,
  errorFallback,
  onError,
}: SuspenseBoundaryProps): ReactElement {
  const retryKey = Math.random()

  return (
    <ErrorBoundary onError={onError} retry={() => {}}>
      <Suspense
        fallback={
          fallback || (
            <div className="p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Carregando...
                </p>
              </div>
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Lazy loading component com Suspense
 */
export function LazyComponent({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}): ReactElement {
  return (
    <Suspense fallback={fallback || <div className="p-4 text-muted-foreground text-sm">Carregando conteúdo...</div>}>
      {children}
    </Suspense>
  )
}
