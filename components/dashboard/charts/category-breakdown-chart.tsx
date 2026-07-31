'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '../chart-card'

export interface CategoryData {
  name: string
  value: number
  percentage?: number
}

interface CategoryBreakdownChartProps {
  data: CategoryData[]
  title?: string
  isLoading?: boolean
  onExport?: (format: 'png' | 'svg') => void
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0]
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold">{data.name}</p>
        <p className="text-xs">
          Valor: R$ {data.value.toLocaleString('pt-BR')}
        </p>
        <p className="text-xs">
          {((data.value / data.payload.total) * 100).toFixed(1)}% do total
        </p>
      </div>
    )
  }
  return null
}

export const CategoryBreakdownChart = React.memo(function CategoryBreakdownChart({
  data,
  title = 'Distribuição por Categoria',
  isLoading,
  onExport,
  colors = DEFAULT_COLORS,
}: CategoryBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const enrichedData = data.map((item) => ({ ...item, total }))

  return (
    <ChartCard
      title={title}
      isLoading={isLoading}
      onExport={onExport}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${(percentage || 0).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {enrichedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

CategoryBreakdownChart.displayName = 'CategoryBreakdownChart'
