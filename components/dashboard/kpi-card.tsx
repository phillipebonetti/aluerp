'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendIcon } from './trend-icon'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  suffix?: string
  prefix?: string
  trend?: {
    value: number
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
  }
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  onClick?: () => void
  isLoading?: boolean
  formatValue?: (value: number) => string
}

const colorClasses = {
  default: 'text-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
}

const bgColorClasses = {
  default: 'bg-gray-50 dark:bg-gray-900',
  success: 'bg-green-50 dark:bg-green-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  danger: 'bg-red-50 dark:bg-red-900/20',
  info: 'bg-blue-50 dark:bg-blue-900/20',
}

export const KPICard = React.memo(function KPICard({
  title,
  value,
  suffix,
  prefix,
  trend,
  icon,
  color = 'default',
  onClick,
  isLoading,
  formatValue,
}: KPICardProps) {
  const formattedValue = typeof value === 'number' && formatValue ? formatValue(value) : value

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <>
                  {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
                  <p className={cn('text-2xl font-bold', colorClasses[color])}>
                    {formattedValue}
                  </p>
                  {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
                </>
              )}
            </div>

            {trend && !isLoading && (
              <div className="flex items-center gap-1 mt-3">
                <TrendIcon direction={trend.direction} />
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trend.direction === 'UP' && 'text-green-600 dark:text-green-400',
                    trend.direction === 'DOWN' && 'text-red-600 dark:text-red-400',
                    trend.direction === 'NEUTRAL' && 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {Math.abs(trend.value)}% {trend.direction === 'UP' ? 'vs período anterior' : 'vs período anterior'}
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div
              className={cn(
                'p-3 rounded-lg',
                bgColorClasses[color]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

KPICard.displayName = 'KPICard'
