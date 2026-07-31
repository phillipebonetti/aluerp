'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RankingItem {
  id: string
  name: string
  value: number
  trend?: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
    percent: number
  }
  badge?: React.ReactNode
}

interface RankingCardProps {
  title: string
  items: RankingItem[]
  limit?: number
  suffix?: string
  format?: (value: number) => string
  onItemClick?: (item: RankingItem) => void
}

export const RankingCard = React.memo(function RankingCard({
  title,
  items,
  limit = 5,
  suffix = '',
  format,
  onItemClick,
}: RankingCardProps) {
  const limitedItems = items.slice(0, limit)
  const maxValue = Math.max(...items.map(i => i.value), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {limitedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados disponíveis
          </p>
        ) : (
          limitedItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors',
                onItemClick && 'cursor-pointer'
              )}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.trend && (
                    <p className={cn(
                      'text-xs',
                      item.trend.direction === 'UP' && 'text-green-600',
                      item.trend.direction === 'DOWN' && 'text-red-600',
                      item.trend.direction === 'NEUTRAL' && 'text-gray-600'
                    )}>
                      {item.trend.direction === 'UP' ? '↑' : item.trend.direction === 'DOWN' ? '↓' : '→'} {item.trend.percent}%
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full flex-1 w-16">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-right min-w-fit">
                  {format ? format(item.value) : item.value.toLocaleString('pt-BR')}
                  {suffix && <span className="text-xs text-muted-foreground ml-1">{suffix}</span>}
                </p>
              </div>

              {item.badge && <div>{item.badge}</div>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
})

RankingCard.displayName = 'RankingCard'
