'use client'

import { Card } from '@/components/ui/card'
import type { FunnelData } from '@/src/modules/crm/types'
import { formatCurrency } from '@/lib/crm/utils'

interface FunnelChartProps {
  data: FunnelData[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxWidth = 100

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-6">Funil de Vendas</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const widthPercent = (item.count / Math.max(...data.map(d => d.count))) * maxWidth
          return (
            <div key={item.stage} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.stage}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.count} oportunidades</span>
                  <span>{item.percentage}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded transition-all"
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent > 30 && (
                    <div className="flex items-center justify-center h-full text-white text-xs font-semibold">
                      {formatCurrency(item.value)}
                    </div>
                  )}
                </div>
                {widthPercent <= 30 && (
                  <span className="text-xs font-semibold text-gray-700">
                    {formatCurrency(item.value)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
