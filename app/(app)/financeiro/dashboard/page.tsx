'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFinancialDashboard, getMonthlyChartData, getExpenseCategoryBreakdown } from '@/app/actions/cash-flow'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'

// TODO: Get from auth context
const companyId = 'test-company-id'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6']

export default function FinancialDashboardPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadDashboard() {
    try {
      setIsLoading(true)

      const [kpisData, monthly, categories] = await Promise.all([
        getFinancialDashboard(companyId),
        getMonthlyChartData(companyId),
        getExpenseCategoryBreakdown(companyId),
      ])

      setKpis(kpisData)
      setMonthlyData(monthly || [])
      setCategoryData(categories || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (isLoading) {
    return <div className="p-6 text-center">Carregando dashboard...</div>
  }

  const kpiCards = [
    {
      label: 'Receita Total',
      value: kpis?.totalRevenue || 0,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Despesas Totais',
      value: kpis?.totalExpenses || 0,
      icon: TrendingDown,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Lucro Líquido',
      value: kpis?.netProfit || 0,
      icon: DollarSign,
      color: (kpis?.netProfit || 0) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
    },
    {
      label: 'Margem',
      value: `${(kpis?.profitMargin || 0).toFixed(1)}%`,
      icon: Percent,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Ticket Médio',
      value: kpis?.averageTicket || 0,
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Em Aberto',
      value: kpis?.outstandingValue || 0,
      icon: AlertCircle,
      color: 'bg-yellow-50 text-yellow-600',
    },
  ]

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader title="Dashboard Financeiro" description="Visão geral da saúde financeira da empresa" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => (
          <Card key={index} className={`p-4 ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold mt-2">
                  {typeof card.value === 'string'
                    ? card.value
                    : `R$ ${card.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                </p>
              </div>
              <card.icon className="h-8 w-8 opacity-20" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receitas x Despesas (Últimos 12 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
              <Legend />
              <Bar dataKey="inflow" fill="#10b981" name="Receitas" />
              <Bar dataKey="outflow" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

import { AlertCircle } from 'lucide-react'
