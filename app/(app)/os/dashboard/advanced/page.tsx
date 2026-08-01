'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, Users, DollarSign, Package, CheckCircle } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const DUMMY_DATA = {
  performanceIndex: 78,
  overview: {
    total: 45,
    inProgress: 12,
    completed: 28,
    overdue: 5,
    completionRate: 62.22,
  },
  financial: {
    totalValue: 250000,
    inProgressValue: 85000,
    completedValue: 165000,
  },
  topVendors: [
    { name: 'João Silva', totalOS: 15, totalCommission: 7500 },
    { name: 'Maria Santos', totalOS: 12, totalCommission: 6000 },
    { name: 'Pedro Costa', totalOS: 8, totalCommission: 4000 },
  ],
  topClients: [
    { name: 'Cliente A', totalValue: 50000, osCount: 5 },
    { name: 'Cliente B', totalValue: 45000, osCount: 4 },
    { name: 'Cliente C', totalValue: 38000, osCount: 3 },
  ],
  materials: {
    totalCost: 78000,
    pending: 34,
    receiptRate: 65.5,
  },
  alerts: {
    overdueOS: [
      { number: 'OS-001', client: { name: 'Cliente X' }, daysOverdue: 5 },
      { number: 'OS-002', client: { name: 'Cliente Y' }, daysOverdue: 2 },
    ],
    overdueCritical: [],
  },
  statusData: [
    { name: 'Rascunho', value: 5 },
    { name: 'Agendado', value: 8 },
    { name: 'Em Progresso', value: 12 },
    { name: 'Concluído', value: 28 },
    { name: 'Cancelado', value: 2 },
  ],
  timelineData: [
    { date: '2026-07-01', count: 3 },
    { date: '2026-07-05', count: 5 },
    { date: '2026-07-10', count: 4 },
    { date: '2026-07-15', count: 6 },
    { date: '2026-07-20', count: 4 },
    { date: '2026-07-25', count: 3 },
    { date: '2026-07-30', count: 2 },
  ],
}

export default function AdvancedDashboardPage() {
  const [data, setData] = useState(DUMMY_DATA)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <div className="p-6">Carregando dashboard...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Avançado</h1>
        <p className="text-muted-foreground">Visão geral de desempenho e indicadores</p>
      </div>

      {/* Performance Index */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Índice de Desempenho</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{data.performanceIndex}%</p>
          </div>
          <div className="text-right">
            <Badge className="bg-blue-100 text-blue-800 mb-2">
              {data.performanceIndex >= 80 ? 'Excelente' : data.performanceIndex >= 60 ? 'Bom' : 'Atenção'}
            </Badge>
            <p className="text-sm text-blue-600 mt-2">Baseado em múltiplos KPIs</p>
          </div>
        </div>
      </Card>

      {/* Main KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de OS</p>
          <p className="text-3xl font-bold mt-2">{data.overview.total}</p>
          <p className="text-xs text-muted-foreground mt-1">↑ 5% vs mês anterior</p>
        </Card>
        <Card className="p-4 border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Em Andamento</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data.overview.inProgress}</p>
        </Card>
        <Card className="p-4 border-green-200">
          <p className="text-sm text-green-700 font-medium">Concluídas</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.overview.completed}</p>
        </Card>
        <Card className="p-4 border-red-200">
          <p className="text-sm text-red-700 font-medium">Atrasadas</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{data.overview.overdue}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
          <p className="text-3xl font-bold mt-2">{data.overview.completionRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-4 border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Valor Total</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">R$ {(data.financial.totalValue / 1000).toFixed(0)}k</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.statusData} cx="50%" cy="50%" labelLine={false} label={{ fontSize: 12 }} outerRadius={80} fill="#8884d8" dataKey="value">
                {data.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} OS`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Criações (Últimos 30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Vendors & Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Vendedores
          </h3>
          <div className="space-y-3">
            {data.topVendors.map((vendor, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.totalOS} OS</p>
                </div>
                <p className="font-semibold">R$ {vendor.totalCommission.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Top Clientes
          </h3>
          <div className="space-y-3">
            {data.topClients.map((client, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.osCount} OS</p>
                </div>
                <p className="font-semibold">R$ {(client.totalValue / 1000).toFixed(0)}k</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Materials & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Materiais
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">R$ {(data.materials.totalCost / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pendentes: {data.materials.pending}</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${100 - data.materials.receiptRate}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Taxa de recebimento: {data.materials.receiptRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </h3>
          <div className="space-y-2">
            {data.alerts.overdueOS.length > 0 ? (
              data.alerts.overdueOS.map((os, i) => (
                <div key={i} className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="font-medium text-red-900">{os.number}</p>
                  <p className="text-sm text-red-700">{os.client.name} - {os.daysOverdue} dias atrasado</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-green-600">Nenhuma OS atrasada</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
