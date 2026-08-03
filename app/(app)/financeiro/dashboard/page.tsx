'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw, Download } from 'lucide-react'

const companyId = 'test-company-id'
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#6366f1']

export default function FinancialDashboardPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadDashboard() {
    try {
      setIsLoading(true)

      const [kpisData, monthly, expenses] = await Promise.all([
        getFinancialDashboard(companyId),
        getMonthlyChartData(companyId),
        getExpenseCategoryBreakdown(companyId),
      ])

      setKpis(kpisData)
      setMonthlyData(monthly || [])
      setExpenseData(expenses || [])

      // Mock revenue data
      setRevenueData([
        { category: 'Serviços', value: 45000 },
        { category: 'Produtos', value: 32000 },
        { category: 'Aluguel', value: 18000 },
        { category: 'Outros', value: 12000 },
      ])

      // Mock daily data
      setDailyData([
        { date: '01/01', inflow: 5000, outflow: 2000, balance: 48230 },
        { date: '02/01', inflow: 8500, outflow: 3200, balance: 53030 },
        { date: '03/01', inflow: 12000, outflow: 5000, balance: 60030 },
        { date: '04/01', inflow: 6500, outflow: 2800, balance: 63730 },
        { date: '05/01', inflow: 9000, outflow: 4000, balance: 68730 },
      ])
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

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Dashboard Financeiro" description="Visão em tempo real do fluxo de caixa" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-transparent">
          <p className="text-sm text-gray-600">Saldo Atual</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">R$ {(kpis?.currentBalance || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-transparent">
          <p className="text-sm text-gray-600">Entradas Hoje</p>
          <p className="text-3xl font-bold mt-2 text-green-600">R$ {(kpis?.todayInflow || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-transparent">
          <p className="text-sm text-gray-600">Saídas Hoje</p>
          <p className="text-3xl font-bold mt-2 text-red-600">R$ {(kpis?.todayOutflow || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-transparent">
          <p className="text-sm text-gray-600">Saldo Previsto</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">R$ {(kpis?.forecastedBalance || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-transparent">
          <p className="text-sm text-gray-600">Receber (30d)</p>
          <p className="text-3xl font-bold mt-2 text-cyan-600">R$ {(kpis?.receivingDue30Days || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-transparent">
          <p className="text-sm text-gray-600">Pagar (30d)</p>
          <p className="text-3xl font-bold mt-2 text-orange-600">R$ {(kpis?.payingDue30Days || 5000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50 to-transparent">
          <p className="text-sm text-gray-600">Resultado do Mês</p>
          <p className={`text-3xl font-bold mt-2 ${(kpis?.monthResult || 0) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
            R$ {(kpis?.monthResult || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-transparent">
          <p className="text-sm text-gray-600">Lucro Líquido</p>
          <p className={`text-3xl font-bold mt-2 ${(kpis?.yearResult || 0) >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            R$ {((kpis?.yearResult || 0) / 1000).toFixed(0)}k
          </p>
        </Card>
      </div>

      {/* 4 Gráficos */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Fluxo Diário</TabsTrigger>
          <TabsTrigger value="monthly">Fluxo Mensal</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fluxo Diário</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
                <Legend />
                <Line type="monotone" dataKey="inflow" stroke="#10b981" name="Entradas" strokeWidth={2} />
                <Line type="monotone" dataKey="outflow" stroke="#ef4444" name="Saídas" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Saldo" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fluxo Mensal (Últimos 12 meses)</h3>
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
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Receitas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={revenueData} cx="50%" cy="50%" labelLine={false} label={({ category, value }) => `${category}: R$ ${value.toLocaleString('pt-BR')}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {revenueData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toLocaleString('pt-BR')}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {expenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
