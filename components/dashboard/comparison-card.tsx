'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendIcon } from './trend-icon'
import { cn } from '@/lib/utils'

interface ComparisonItem {
  label: string
  current: number
  previous: number
  suffix?: string
  format?: (value: number) => string
}

interface ComparisonCardProps {
  title: string
  description?: string
  items: ComparisonItem[]
}

export const ComparisonCard = React.memo(function ComparisonCard({
  title,
  description,
  items,
}: ComparisonCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const diff = item.current - item.previous
          const percentDiff = item.previous !== 0 ? (diff / item.previous) * 100 : 0
          const isPositive = diff >= 0

          const formatValue = item.format || ((value: number) => value.toLocaleString('pt-BR'))

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isPositive ? '+' : '-'}{Math.abs(percentDiff).toFixed(1)}%
                  </span>
                  <TrendIcon
                    direction={isPositive ? 'UP' : 'DOWN'}
                    size={14}
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Período atual</p>
                  <p className="text-lg font-bold">
                    {formatValue(item.current)}
                    {item.suffix && <span className="text-xs ml-1">{item.suffix}</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Período anterior</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {formatValue(item.previous)}
                    {item.suffix && <span className="text-xs ml-1">{item.suffix}</span>}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isPositive ? 'bg-green-500' : 'bg-red-500'
                  )}
                  style={{
                    width: `${Math.min((item.current / Math.max(item.current, item.previous)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
})

ComparisonCard.displayName = 'ComparisonCard'
