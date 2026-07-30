'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ChartData {
  name: string
  value: number
  count?: number
}

interface CRMAdvancedChartsProps {
  leadsBySource: ChartData[]
  salesByRep: ChartData[]
  monthlyEvolution: Array<{ month: string; sales: number; opportunities: number }>
  averageClosingTime: ChartData[]
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export function CRMAdvancedCharts({ 
  leadsBySource, 
  salesByRep, 
  monthlyEvolution,
  averageClosingTime 
}: CRMAdvancedChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Leads por Origem */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Leads por Origem</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={leadsBySource}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {leadsBySource.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Vendas por Vendedor */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Vendas por Vendedor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByRep}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Evolução Mensal */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyEvolution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Vendas" />
            <Line type="monotone" dataKey="opportunities" stroke="#3b82f6" strokeWidth={2} name="Oportunidades" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tempo Médio de Fechamento */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Tempo Médio de Fechamento por Etapa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={averageClosingTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value} dias`} />
            <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Dias médios" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
