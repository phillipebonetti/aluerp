import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MoneyCardProps {
  title: string
  value: number | string
  currency?: 'BRL' | 'USD' | 'EUR'
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  variant?: 'income' | 'expense' | 'balance' | 'neutral'
  description?: string
  className?: string
  onClick?: () => void
}

export function MoneyCard({
  title,
  value,
  currency = 'BRL',
  icon: Icon,
  trend,
  trendLabel,
  variant = 'balance',
  description,
  className,
  onClick,
}: MoneyCardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-accent/30 hover:shadow-sm group',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-semibold text-foreground tracking-tight">{formatValue(value)}</span>
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            variant === 'income' && 'bg-success/10 text-success',
            variant === 'expense' && 'bg-destructive/10 text-destructive',
            variant === 'balance' && 'bg-accent/10 text-accent',
            variant === 'neutral' && 'bg-muted text-muted-foreground',
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
