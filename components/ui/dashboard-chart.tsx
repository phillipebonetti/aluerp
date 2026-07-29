import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Skeleton } from './loading-state'

interface DashboardChartProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  loading?: boolean
  error?: string
}

export function DashboardChart({
  title,
  description,
  children,
  footer,
  className,
  loading = false,
  error,
}: DashboardChartProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : error ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
          <div className="text-center">
            <p className="text-sm text-destructive font-medium">Erro ao carregar</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">{children}</div>
          {footer && <div className="border-t border-border pt-4 mt-4">{footer}</div>}
        </>
      )}
    </div>
  )
}
