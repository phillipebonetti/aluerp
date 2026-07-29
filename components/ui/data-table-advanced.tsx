import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface Column<T> {
  key: keyof T | string
  label: string
  className?: string
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableAdvancedProps<T> {
  columns: Column<T>[]
  data: T[]
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onRowClick?: (row: T) => void
  className?: string
  loading?: boolean
}

export function DataTableAdvanced<T extends Record<string, any>>({
  columns,
  data,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onRowClick,
  className,
  loading = false,
}: DataTableAdvancedProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const canPrevious = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <div className={cn('space-y-4', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5 first:pl-5',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-border/50 last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/30',
                  loading && 'opacity-50 pointer-events-none'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-5 py-3 first:pl-5">
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : <span className="text-xs text-foreground">{String(row[col.key as keyof T] ?? '')}</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems} resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canPrevious || loading}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1
                const isActive = page === currentPage
                const isNear = Math.abs(page - currentPage) <= 1

                if (!isActive && !isNear && totalPages > 5) return null

                return (
                  <Button
                    key={page}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className="h-7 min-w-7 text-xs"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext || loading}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
