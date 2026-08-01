'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, CheckCircle } from 'lucide-react'

interface KPI {
  label: string
  value: number
  format: 'currency' | 'number' | 'percentage'
  trend?: number
  icon: React.ReactNode
}

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState('month')
  const [compareYear, setCompareYear] = useState('yes')
  const [loading, setLoading] = useState(true)

  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Faturamento', value: 185000, format: 'currency', trend: 12.5, icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Lucro', value: 52000, format: 'currency', trend: 8.3, icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Margem', value: 28, format: 'percentage', trend: 2.1, icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Receitas', value: 195000, format: 'currency', trend: 15, icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Despesas', value: 143000, format: 'currency', trend: -5, icon: <TrendingDown className="h-5 w-5" /> },
    { label: 'Fluxo de Caixa', value: 52000, format: 'currency', trend: 10, icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Ticket Médio', value: 8500, format: 'currency', trend: 3.2, icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Obras em Andamento', value: 12, format: 'number', trend: 2, icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Obras Concluídas', value: 28, format: 'number', trend: 4, icon: <CheckCircle className="h-5 w-5" /> },
    { label: 'Clientes Ativos', value: 45, format: 'number', trend: 5, icon: <Users className="h-5 w-5" /> },
    { label: 'Clientes Novos', value: 8, format: 'number', trend: 1, icon: <Users className="h-5 w-5" /> },
    { label: 'OS Abertas', value: 34, format: 'number', trend: -2, icon: <Briefcase className="h-5 w-5" /> },
    { label: 'OS Finalizadas', value: 89, format: 'number', trend: 12, icon: <CheckCircle className="h-5 w-5" /> },
    { label: 'Taxa de Conclusão', value: 85, format: 'percentage', trend: 3, icon: <TrendingUp className="h-5 w-5" /> },
  ])

  const lineChartData: ChartData[] = [
    { name: 'Jan', faturamento: 65000, lucro: 18000, despesas: 47000 },
    { name: 'Fev', faturamento: 72000, lucro: 21000, despesas: 51000 },
    { name: 'Mar', faturamento: 68000, lucro: 19500, despesas: 48500 },
    { name: 'Abr', faturamento: 85000, lucro: 25000, despesas: 60000 },
    { name: 'Mai', faturamento: 95000, lucro: 28500, despesas: 66500 },
    { name: 'Jun', faturamento: 102000, lucro: 30000, despesas: 72000 },
  ]

  const barChartData: ChartData[] = [
    { name: 'Vendedor 1', vendas: 45000 },
    { name: 'Vendedor 2', vendas: 38000 },
    { name: 'Vendedor 3', vendas: 32000 },
    { name: 'Vendedor 4', vendas: 28000 },
    { name: 'Vendedor 5', vendas: 42000 },
  ]

  const pieChartData: ChartData[] = [
    { name: 'Residencial', value: 35 },
    { name: 'Comercial', value: 28 },
    { name: 'Industrial', value: 22 },
    { name: 'Outros', value: 15 },
  ]

  const areaChartData: ChartData[] = [
    { name: 'Seg', receitas: 12000, despesas: 9000 },
    { name: 'Ter', receitas: 13500, despesas: 9500 },
    { name: 'Qua', receitas: 14200, despesas: 10000 },
    { name: 'Qui', receitas: 15800, despesas: 11200 },
    { name: 'Sex', receitas: 16500, despesas: 11800 },
    { name: 'Sab', receitas: 12000, despesas: 8500 },
    { name: 'Dom', receitas: 11000, despesas: 8000 },
  ]

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return `R$ ${value.toLocaleString('pt-BR')}`
    if (format === 'percentage') return `${value}%`
    return value.toLocaleString('pt-BR')
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Dashboard Executivo" description="Visão geral de todos os KPIs" />
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Exportar PDF</Button>
          <Button variant="outline">Exportar Excel</Button>
        </div>
      </div>

      {/* KPI Cards - 14 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold">{formatValue(kpi.value, kpi.format)}</div>
                {kpi.trend !== undefined && (
                  <div className={`text-sm mt-2 flex items-center gap-1 ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(kpi.trend)}% vs período anterior
                  </div>
                )}
              </div>
              <div className="text-gray-400">{kpi.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráficos - 5 tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Faturamento, Lucro e Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="faturamento" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Barras */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ranking de Vendedores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Distribuição por Tipo de Obra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#3b82f6" dataKey="value" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Área */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Receitas vs Despesas (Semanal)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10b981" fill="#d1fae5" />
              <Area type="monotone" dataKey="despesas" stackId="1" stroke="#ef4444" fill="#fee2e2" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Heatmap simulado com tabela */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Heatmap de Desempenho por Cliente</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = Math.random()
              const color = intensity > 0.7 ? 'bg-green-500' : intensity > 0.4 ? 'bg-yellow-500' : 'bg-red-200'
              return (
                <div key={i} className={`w-12 h-12 ${color} rounded flex items-center justify-center text-xs font-semibold text-white`}>
                  {i + 1}
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded" />
              <span>Baixo</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Comparativos */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Comparativo Anual</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: '2024 YTD', value: 'R$ 612.000' },
            { label: '2023 YTD', value: 'R$ 542.000' },
            { label: 'Crescimento', value: '+12.9%', positive: true },
            { label: 'Meta 2024', value: 'R$ 800.000' },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-2">{item.label}</div>
              <div className={`text-xl font-bold ${item.positive ? 'text-green-600' : ''}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
