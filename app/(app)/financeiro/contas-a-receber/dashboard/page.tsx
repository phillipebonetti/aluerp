'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercentage } from '@/src/lib/utils'

export default function ARDashboardPage() {
  // Mock data - replace with real data from API
  const kpis = [
    { label: 'Receita Prevista', value: 150000, color: 'text-blue-600' },
    { label: 'Receita Realizada', value: 98000, color: 'text-green-600' },
    { label: 'Valor Vencido', value: 22000, color: 'text-red-600' },
    { label: 'Taxa de Inadimplência', value: 14.67, color: 'text-orange-600', suffix: '%' },
    { label: 'Ticket Médio', value: 8500, color: 'text-purple-600' },
    { label: 'Prazo Médio', value: 28, color: 'text-indigo-600', suffix: ' dias' },
  ]

  const receivablesByMonth = [
    { name: 'Jan', previsto: 15000, realizado: 12000 },
    { name: 'Fev', previsto: 18000, realizado: 16000 },
    { name: 'Mar', previsto: 22000, realizado: 20000 },
    { name: 'Abr', previsto: 20000, realizado: 18000 },
    { name: 'Mai', previsto: 25000, realizado: 23000 },
    { name: 'Jun', previsto: 28000, realizado: 24000 },
  ]

  const receivablesByClient = [
    { name: 'Cliente A', value: 35000 },
    { name: 'Cliente B', value: 28000 },
    { name: 'Cliente C', value: 22000 },
    { name: 'Cliente D', value: 18000 },
    { name: 'Outros', value: 47000 },
  ]

  const receivablesByPaymentMethod = [
    { name: 'PIX', value: 45000 },
    { name: 'Boleto', value: 35000 },
    { name: 'Transferência', value: 30000 },
    { name: 'Cheque', value: 15000 },
  ]

  const forecastData = [
    { date: '01/06', previsto: 150000, realizado: 98000 },
    { date: '08/06', previsto: 155000, realizado: 105000 },
    { date: '15/06', previsto: 160000, realizado: 115000 },
    { date: '22/06', previsto: 165000, realizado: 125000 },
    { date: '29/06', previsto: 170000, realizado: 135000 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Contas a Receber</h1>
        <p className="text-gray-600 mt-2">Indicadores e análises de receitas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${kpi.color}`}>
                {kpi.suffix === '%' ? kpi.value.toFixed(2) : formatCurrency(kpi.value)}
                {kpi.suffix && <span className="text-lg ml-1">{kpi.suffix}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recebimentos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receivablesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="previsto" fill="#3b82f6" name="Previsto" />
                <Bar dataKey="realizado" fill="#10b981" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recebimentos por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={receivablesByClient}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {receivablesByClient.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recebimentos por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={receivablesByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {receivablesByPaymentMethod.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas Previstas x Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="previsto" stroke="#3b82f6" name="Previsto" strokeWidth={2} />
                <Line type="monotone" dataKey="realizado" stroke="#10b981" name="Realizado" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
