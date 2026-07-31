'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  loading = false
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200',
    success: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200',
    danger: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'
  }

  const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600'
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown

  return (
    <Card className={cn('border', variantStyles[variant])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 bg-muted rounded mt-2 animate-pulse w-24" />
            ) : (
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend)}% em relação ao mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
