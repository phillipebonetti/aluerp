'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  formatCurrency, 
  getTrendColor, 
  getTrendBgColor, 
  formatPercentage,
  formatNumber 
} from '@/src/utils/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface MetricCardProps {
  title: string
  value: number
  trend?: number
  icon?: React.ReactNode
  loading?: boolean
  format?: 'currency' | 'percentage' | 'number'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  loading = false,
  format = 'currency',
  variant = 'default'
}: MetricCardProps) {
  const variants = {
    default: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  }

  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : format === 'percentage'
    ? formatPercentage(value)
    : formatNumber(value)

  const trendColor = trend ? getTrendColor(trend) : ''
  const trendBg = trend ? getTrendBgColor(trend) : ''
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown

  return (
    <Card className={cn('border', variants[variant])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{formattedValue}</p>
            )}
          </div>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>

        {trend !== undefined && !loading && (
          <div className={cn('flex items-center gap-1 text-sm font-medium p-2 rounded', trendColor, trendBg)}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
