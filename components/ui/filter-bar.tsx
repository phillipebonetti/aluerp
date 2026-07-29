import { cn } from '@/lib/utils'
import { Button } from './button'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

export interface FilterItem {
  id: string
  label: string
}

interface FilterBarProps {
  filters: FilterItem[]
  onRemove: (id: string) => void
  onClearAll: () => void
  children?: ReactNode
  className?: string
  showClearAll?: boolean
}

export function FilterBar({
  filters,
  onRemove,
  onClearAll,
  children,
  className,
  showClearAll = true,
}: FilterBarProps) {
  const hasFilters = filters.length > 0

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children && <div className="flex items-center gap-2 border-r border-border pr-2">{children}</div>}

      {filters.map((filter) => (
        <div
          key={filter.id}
          className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-foreground"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.id)}
            className="p-0.5 hover:bg-muted-foreground/20 rounded transition-colors"
            aria-label="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {hasFilters && showClearAll && (
        <Button variant="ghost" size="xs" onClick={onClearAll} className="text-xs">
          Limpar tudo
        </Button>
      )}
    </div>
  )
}
