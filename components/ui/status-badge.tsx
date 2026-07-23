import { cn } from '@/lib/utils'
import { statusColors } from '@/lib/mock-data'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        statusColors[status] ?? 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {status}
    </span>
  )
}
