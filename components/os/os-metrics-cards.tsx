'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import type { OSMetricsCard } from '@/src/types/os'

interface OsMetricsCardsProps {
  cards: OSMetricsCard[]
  columns?: number
}

const COLOR_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  danger: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  default: 'bg-gray-50 border-gray-200 text-gray-900',
}

const ICON_COLORS = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
  default: 'text-gray-600',
}

export function OsMetricsCards({ cards, columns = 4 }: OsMetricsCardsProps) {
  const getGridClass = (col: number) => {
    switch (col) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default:
        return 'grid-cols-1'
    }
  }

  return (
    <div className={`grid ${getGridClass(columns)} gap-4`}>
      {cards.map((card, index) => (
        <Card key={index} className={`p-4 border-2 ${COLOR_STYLES[card.color]}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium opacity-90">{card.label}</p>
              {card.trend && (
                <Badge variant="outline" className="gap-1">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : card.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : null}
                  {card.trendPercentage && <span>{card.trendPercentage}%</span>}
                </Badge>
              )}
            </div>

            <div>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>

            {card.icon === 'alert' && (
              <div className="pt-2 flex items-center gap-1 text-xs opacity-75">
                <AlertCircle className="w-4 h-4" />
                <span>Requer atenção</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
