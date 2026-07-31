'use client'

import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '../chart-card'

export interface RevenueExpenseData {
  month: string
  revenue: number
  expense: number
  profit: number
}

interface RevenueExpenseChartProps {
  data: RevenueExpenseData[]
  isLoading?: boolean
  onExport?: (format: 'png' | 'svg') => void
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold">{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const RevenueExpenseChart = React.memo(function RevenueExpenseChart({
  data,
  isLoading,
  onExport,
}: RevenueExpenseChartProps) {
  return (
    <ChartCard
      title="Receita vs Despesa"
      description="Comparativo mensal de receita e despesa"
      isLoading={isLoading}
      onExport={onExport}
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Receita" radius={[8, 8, 0, 0]} />
          <Bar yAxisId="left" dataKey="expense" fill="#ef4444" name="Despesa" radius={[8, 8, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

RevenueExpenseChart.displayName = 'RevenueExpenseChart'
