'use client'

import { Card } from '@/components/ui/card'
import type { ConversionData } from '@/src/modules/crm/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STAGE_LABELS } from '@/lib/crm/utils'

interface ConversionChartProps {
  data: ConversionData[]
}

export function ConversionChart({ data }: ConversionChartProps) {
  const chartData = data.map(item => ({
    stage: STAGE_LABELS[item.stage],
    total: item.count,
    convertidos: item.converted,
    taxa: item.rate
  }))

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Taxa de Conversão por Estágio</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value) => [value, '']} />
          <Legend />
          <Bar dataKey="total" fill="#8b5cf6" name="Total" />
          <Bar dataKey="convertidos" fill="#10b981" name="Convertidos" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map(item => (
          <div key={item.stage} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{STAGE_LABELS[item.stage]}</span>
            <span className="font-semibold">{item.rate}% ({item.converted}/{item.count})</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
