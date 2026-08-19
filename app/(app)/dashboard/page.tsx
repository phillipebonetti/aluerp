'use client'

import { useState } from 'react'
import { useDashboardData, useDashboardFilters, type DashboardFilters } from '@/src/hooks/useDashboardData'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ChartContainer } from '@/components/dashboard/chart-container'
import { DashboardFilterBar } from '@/components/dashboard/dashboard-filters'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'
import { EvolutionChart } from '@/components/dashboard/evolution-chart'
import { RankingTable } from '@/components/dashboard/ranking-table'
import { DueAccountsList } from '@/components/dashboard/due-accounts-list'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Calendar,
  Users
} from 'lucide-react'
import { calculatePercentageProgress } from '@/src/utils/dashboard'

// Temporary company ID - will come from session
const COMPANY_ID = 'temp-company-id'

const MOCK_DUE_ACCOUNTS = [
  { id: '1', name: 'Fornecedor X', amount: 5000, dueDate: new Date('2024-01-08T12:00:00.000Z'), type: 'pay' as const },
  { id: '2', name: 'Cliente Y', amount: 8000, dueDate: new Date('2024-01-10T12:00:00.000Z'), type: 'receive' as const },
  { id: '3', name: 'Cliente Z', amount: 3000, dueDate: new Date('2024-01-15T12:00:00.000Z'), type: 'receive' as const },
]

export default function ExecutiveDashboardPage() {
  const { filters, updateFilters } = useDashboardFilters()
  const { kpis, cashFlow, metrics, sellers, loading, error, refetch } = useDashboardData(COMPANY_ID, filters)
  const [renderKey, setRenderKey] = useState(0)

  // Mock data for demonstration
  const mockTopClients = [
    { id: '1', name: 'Cliente A', value: 50000, quantity: 5, growth: 15, percentage: 35 },
    { id: '2', name: 'Cliente B', value: 35000, quantity: 3, growth: -5, percentage: 25 },
    { id: '3', name: 'Cliente C', value: 25000, quantity: 2, growth: 20, percentage: 18 },
  ]

  const mockDueAccounts = MOCK_DUE_ACCOUNTS

  const handleExport = (format: 'pdf' | 'excel' | 'png') => {
    console.log(`Exportando como ${format}`)
    // Implementação de exportação
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefresh = () => {
    refetch()
    setRenderKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Executivo"
        description="Visão geral completa com KPIs, gráficos e análises em tempo real"
      />

      <DashboardFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onExport={handleExport}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erro ao carregar dados</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* LINHA 1: Cards de Métricas Principais */}
      <div key={renderKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Saldo em Caixa"
          value={kpis?.netRevenue || 0}
          trend={kpis ? 12 : undefined}
          loading={loading}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          variant="default"
        />
        <MetricCard
          title="Contas a Receber"
          value={kpis?.receivables || 0}
          trend={kpis ? -5 : undefined}
          loading={loading}
          icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
          variant="warning"
        />
        <MetricCard
          title="Contas a Pagar"
          value={kpis?.payables || 0}
          trend={kpis ? 8 : undefined}
          loading={loading}
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          variant="danger"
        />
        <MetricCard
          title="Fluxo Líquido"
          value={(kpis?.netRevenue || 0) - (kpis?.payables || 0)}
          loading={loading}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          variant="success"
        />
        <MetricCard
          title="Lucro do Mês"
          value={kpis?.profit || 0}
          trend={kpis ? 22 : undefined}
          loading={loading}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          variant="success"
        />
        <MetricCard
          title="Faturamento"
          value={kpis?.totalRevenue || 0}
          loading={loading}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          variant="success"
        />
      </div>

      {/* LINHA 2: Gráfico Receita x Despesas */}
      <ChartContainer
        title="Evolução Financeira"
        description="Receita, Despesa e Saldo"
        loading={loading}
      >
        <RevenueChart data={cashFlow} />
      </ChartContainer>

      {/* LINHA 3: Fluxo de Caixa Diário */}
      <ChartContainer
        title="Fluxo de Caixa"
        description="Entradas e Saídas por período"
        loading={loading}
      >
        <CashFlowChart data={cashFlow} />
      </ChartContainer>

      {/* LINHA 4: Evolução Mensal */}
      <ChartContainer
        title="Evolução Mensal"
        description="Receita, Lucro e Custos"
        loading={loading}
      >
        <EvolutionChart data={cashFlow.map((item, idx) => ({
          ...item,
          profit: item.balance,
          costs: item.income - item.balance
        }))} />
      </ChartContainer>

      {/* LINHA 5: Top Clientes */}
      <ChartContainer
        title="Top 10 Clientes"
        description="Ranking por valor vendido"
        loading={loading}
      >
        <RankingTable
          items={mockTopClients}
          columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'value', label: 'Total Vendido', format: 'currency' },
            { key: 'quantity', label: 'Obras', format: 'number' },
            { key: 'growth', label: 'Crescimento', format: 'percentage' }
          ]}
          loading={loading}
        />
      </ChartContainer>

      {/* LINHA 6: Top Fornecedores */}
      <ChartContainer
        title="Top 10 Fornecedores"
        description="Ranking por valor comprado"
        loading={loading}
      >
        <RankingTable
          items={[
            { id: '1', name: 'Fornecedor A', value: 30000, quantity: 15, average: 2000 },
            { id: '2', name: 'Fornecedor B', value: 22000, quantity: 11, average: 2000 },
            { id: '3', name: 'Fornecedor C', value: 18000, quantity: 9, average: 2000 },
          ]}
          columns={[
            { key: 'name', label: 'Fornecedor' },
            { key: 'value', label: 'Total Comprado', format: 'currency' },
            { key: 'quantity', label: 'Compras', format: 'number' },
            { key: 'average', label: 'Média', format: 'currency' }
          ]}
          loading={loading}
        />
      </ChartContainer>

      {/* LINHA 7: Ranking de Obras */}
      <ChartContainer
        title="Top Obras por Lucro"
        description="Ordenadas por maior margem"
        loading={loading}
      >
        <RankingTable
          items={[
            { id: '1', name: 'Obra Projeto A', value: 50000, quantity: 35000, average: 15000, growth: 30 },
            { id: '2', name: 'Obra Projeto B', value: 45000, quantity: 28000, average: 17000, growth: 25 },
            { id: '3', name: 'Obra Projeto C', value: 38000, quantity: 22000, average: 16000, growth: 20 },
          ]}
          columns={[
            { key: 'name', label: 'Obra' },
            { key: 'value', label: 'Valor Vendido', format: 'currency' },
            { key: 'quantity', label: 'Custo', format: 'currency' },
            { key: 'average', label: 'Lucro', format: 'currency' }
          ]}
          loading={loading}
        />
      </ChartContainer>

      {/* LINHA 8: Ranking de Vendedores */}
      <ChartContainer
        title="Performance de Vendedores"
        description="Ranking por valor de vendas"
        loading={loading}
      >
        <RankingTable
          items={sellers || []}
          columns={[
            { key: 'name', label: 'Vendedor' },
            { key: 'leadsGenerated', label: 'Vendas', format: 'number' },
            { key: 'totalValue', label: 'Valor Total', format: 'currency' },
            { key: 'opportunitiesClosed', label: 'Oportunidades', format: 'number' }
          ]}
          loading={loading}
        />
      </ChartContainer>

      {/* LINHA 9: Contas Vencendo */}
      <ChartContainer
        title="Contas Vencendo"
        description="Agrupadas por data de vencimento"
        loading={loading}
      >
        <DueAccountsList accounts={mockDueAccounts} loading={loading} />
      </ChartContainer>

      {/* LINHA 10: Próximos Recebimentos */}
      <ChartContainer
        title="Próximos Recebimentos"
        description="Contas com vencimento nos próximos 30 dias"
        loading={loading}
      >
        <RankingTable
          items={[
            { id: '1', name: 'Cliente A', value: 8000, quantity: 5, growth: 0 },
            { id: '2', name: 'Cliente B', value: 5500, quantity: 3, growth: 0 },
            { id: '3', name: 'Cliente C', value: 3200, quantity: 2, growth: 0 },
          ]}
          columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'value', label: 'Valor', format: 'currency' },
            { key: 'quantity', label: 'Data Vencimento', format: 'number' }
          ]}
          loading={loading}
        />
      </ChartContainer>

      {/* LINHA 12: Meta Mensal */}
      <ChartContainer
        title="Meta Mensal"
        description="Progresso contra a meta estabelecida"
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Meta de Faturamento</span>
              <span className="text-sm text-gray-600">75% atingido</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>R$ 75.000,00 de R$ 100.000,00</span>
              <span>Previsão: 95% até 30/11</span>
            </div>
          </div>
        </div>
      </ChartContainer>

      {/* LINHA 13: Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartContainer title="Ticket Médio" loading={loading}>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-blue-600">R$ 12.500</p>
            <p className="text-sm text-gray-600 mt-1">+5% vs mês anterior</p>
          </div>
        </ChartContainer>
        <ChartContainer title="Margem Média" loading={loading}>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-green-600">35%</p>
            <p className="text-sm text-gray-600 mt-1">+2% vs mês anterior</p>
          </div>
        </ChartContainer>
        <ChartContainer title="Clientes Ativos" loading={loading}>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-purple-600">42</p>
            <p className="text-sm text-gray-600 mt-1">+3 vs mês anterior</p>
          </div>
        </ChartContainer>
        <ChartContainer title="Obras Ativas" loading={loading}>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-orange-600">8</p>
            <p className="text-sm text-gray-600 mt-1">3 iniciadas este mês</p>
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}
