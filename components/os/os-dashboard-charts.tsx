'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface StatusBreakdownChartProps {
  data: Array<{
    status: string
    count: number
    totalValue: number
  }>
}

export function OSDashboardStatusChart({ data }: StatusBreakdownChartProps) {
  const colors = {
    DRAFT: '#94a3b8',
    SCHEDULED: '#3b82f6',
    IN_PROGRESS: '#f59e0b',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
    ARCHIVED: '#6b7280',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.status as keyof typeof colors] || '#000'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} OS`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PriorityBreakdownChartProps {
  data: Array<{
    priority: string
    count: number
  }>
}

export function OSDashboardPriorityChart({ data }: PriorityBreakdownChartProps) {
  const priorityOrder = { URGENTE: 1, ALTA: 2, NORMAL: 3, BAIXA: 4 }
  const sortedData = [...data].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 99))

  const colors = {
    URGENTE: '#dc2626',
    ALTA: '#f97316',
    NORMAL: '#3b82f6',
    BAIXA: '#10b981',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Prioridade</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="priority" width={80} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.priority as keyof typeof colors] || '#000'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface VendorBreakdownChartProps {
  data: Array<{
    vendor: string
    count: number
    totalValue: number
  }>
}

export function OSDashboardVendorChart({ data }: VendorBreakdownChartProps) {
  const top5 = data.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Vendedores</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} OS`} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TimelineChartProps {
  data: Array<{
    date: string
    count: number
  }>
}

export function OSDashboardTimelineChart({ data }: TimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criações por Dia (últimos 30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
