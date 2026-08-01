'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/src/lib/utils'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react'

// TODO: Get from auth context
const companyId = 'test-company-id'

interface KPI {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  description?: string
}

export default function VendedoresDashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Load data from server actions
    setIsLoading(false)

    // Mock data for demonstration
    setKpis([
      {
        label: 'Total de Vendas',
        value: formatCurrency(145000),
        icon: <DollarSign className="w-6 h-6" />,
        trend: 12,
        description: 'Comparado ao mês anterior',
      },
      {
        label: 'Total de Comissões',
        value: formatCurrency(7250),
        icon: <TrendingUp className="w-6 h-6" />,
        trend: 8,
        description: 'Comissões geradas',
      },
      {
        label: 'Vendedores Ativos',
        value: '12',
        icon: <Users className="w-6 h-6" />,
        description: 'Com vendas no mês',
      },
      {
        label: 'Meta Atingida',
        value: '89%',
        icon: <Target className="w-6 h-6" />,
        trend: -5,
        description: 'Média da equipe',
      },
    ])
  }, [year, month])

  const mockSalesByVendor = [
    { name: 'João Silva', value: 35000, commission: 1750 },
    { name: 'Maria Santos', value: 32000, commission: 1600 },
    { name: 'Pedro Oliveira', value: 28000, commission: 1400 },
    { name: 'Ana Costa', value: 25000, commission: 1250 },
    { name: 'Carlos Lima', value: 25000, commission: 1250 },
  ]

  const mockEvolution = [
    { month: 'Jan', sales: 120000, commission: 6000 },
    { month: 'Fev', sales: 132000, commission: 6600 },
    { month: 'Mar', sales: 128000, commission: 6400 },
    { month: 'Abr', sales: 145000, commission: 7250 },
  ]

  const mockRanking = [
    { position: 1, name: 'João Silva', salesValue: 35000, ordersCount: 8 },
    { position: 2, name: 'Maria Santos', salesValue: 32000, ordersCount: 7 },
    { position: 3, name: 'Pedro Oliveira', salesValue: 28000, ordersCount: 6 },
  ]

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Dashboard de Vendedores"
        description="Acompanhe vendas, comissões e desempenho da equipe"
      />

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <SelectItem key={m} value={String(m)}>
                {new Date(year, m - 1).toLocaleString('pt-BR', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {kpi.icon}
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.trend !== undefined && (
                <p className={`text-xs ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}% vs mês anterior
                </p>
              )}
              {kpi.description && <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Vendas por Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Vendedor</CardTitle>
            <CardDescription>Top 5 vendedores do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSalesByVendor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#3b82f6" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas</CardTitle>
            <CardDescription>Últimos 4 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Vendas" />
                <Line type="monotone" dataKey="commission" stroke="#10b981" name="Comissões" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Vendedores</CardTitle>
          <CardDescription>Posição no mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRanking.map((seller) => (
              <div key={seller.position} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    {seller.position}
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">{seller.ordersCount} pedidos</p>
                  </div>
                </div>
                <p className="font-bold text-lg">{formatCurrency(seller.salesValue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
