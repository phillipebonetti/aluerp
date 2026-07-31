'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '../chart-card'

export interface CashFlowData {
  date: string
  inflow: number
  outflow: number
  balance: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
  isLoading?: boolean
  onExport?: (format: 'png' | 'svg') => void
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold">{payload[0].payload.date}</p>
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

export const CashFlowChart = React.memo(function CashFlowChart({
  data,
  isLoading,
  onExport,
}: CashFlowChartProps) {
  return (
    <ChartCard
      title="Fluxo de Caixa"
      description="Entradas e saídas de caixa ao longo do período"
      isLoading={isLoading}
      onExport={onExport}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="inflow"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorInflow)"
            name="Entradas"
          />
          <Area
            type="monotone"
            dataKey="outflow"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorOutflow)"
            name="Saídas"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

CashFlowChart.displayName = 'CashFlowChart'
