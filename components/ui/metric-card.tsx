import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent'
  description?: string
  className?: string
  onClick?: () => void
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  color = 'accent',
  description,
  className,
  onClick,
  loading = false,
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    accent: 'bg-accent/10 text-accent',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-4 flex items-start gap-3 transition-all duration-200 hover:border-accent/30 hover:shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg', colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-lg font-semibold text-foreground mt-1 truncate">
          {loading ? <span className="animate-pulse">−</span> : value}
        </p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  )
}
