import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  variant?: 'default' | 'positive' | 'negative' | 'neutral'
  className?: string
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  className,
}: DashboardCardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0

  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-accent/30 hover:shadow-sm group',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-semibold text-foreground tracking-tight">{value}</span>
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            variant === 'positive' && 'bg-success/10 text-success',
            variant === 'negative' && 'bg-destructive/10 text-destructive',
            variant === 'neutral' && 'bg-muted text-muted-foreground',
            variant === 'default' && 'bg-accent/10 text-accent',
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {(trend !== undefined || description) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded',
                isPositive && 'text-success bg-success/10',
                isNegative && 'text-destructive bg-destructive/10',
                !isPositive && !isNegative && 'text-muted-foreground bg-muted',
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNegative ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>{isPositive ? '+' : ''}{trend}%</span>
            </div>
          )}
          {(description || trendLabel) && (
            <span className="text-xs text-muted-foreground">{description || trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
