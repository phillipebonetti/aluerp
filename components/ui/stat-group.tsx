import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Stat {
  label: string
  value: string | number | ReactNode
  variant?: 'default' | 'muted' | 'highlight'
}

interface StatGroupProps {
  stats: Stat[]
  columns?: number
  className?: string
}

export function StatGroup({ stats, columns = 2, className }: StatGroupProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridClass[columns as keyof typeof gridClass] || gridClass[2], className)}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            'px-4 py-3 rounded-lg border border-border',
            stat.variant === 'muted' && 'bg-muted/30',
            stat.variant === 'highlight' && 'bg-accent/10 border-accent/30'
          )}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          <p className="text-lg font-semibold text-foreground mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
