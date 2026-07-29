import { MoneyCard, MetricCard, SectionCard, DataTable } from '@/components/ui'
import { CashFlowChart, EntradasSaidasChart, ExpensesChart } from '@/components/dashboard/charts'
import { recentOrders } from '@/lib/mock-data'
import { STATUS_COLORS } from '@/lib/constants'
import { getDashboardKPIs } from '@/src/modules/dashboard/actions'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ClipboardList,
  HardHat,
  Users,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const kpisResult = await getDashboardKPIs()
  const kpis = kpisResult.data || {
    saldoAtual: 0,
    entradasMes: 0,
    saidasMes: 0,
    lucroMes: 0,
    osAbertas: 0,
    obrasAtivas: 0,
    clientesAtivos: 0,
    vencidosPending: 0,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do desempenho da sua empresa.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MoneyCard
          title="Saldo Atual"
          value={kpis.saldoAtual}
          icon={Wallet}
          variant="balance"
          description="Conta corrente"
        />
        <MoneyCard
          title="Entradas do Mês"
          value={kpis.entradasMes}
          icon={TrendingUp}
          variant="income"
          trend={0}
          trendLabel="vs. mês anterior"
        />
        <MoneyCard
          title="Saídas do Mês"
          value={kpis.saidasMes}
          icon={TrendingDown}
          variant="expense"
          trend={0}
          trendLabel="vs. mês anterior"
        />
        <MoneyCard
          title="Lucro do Mês"
          value={kpis.lucroMes}
          icon={DollarSign}
          variant="income"
          trend={0}
          trendLabel="vs. mês anterior"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="OS Abertas"
          value={kpis.osAbertas}
          icon={ClipboardList}
          color="accent"
        />
        <MetricCard
          title="Obras Ativas"
          value={kpis.obrasAtivas}
          icon={HardHat}
          color="warning"
        />
        <MetricCard
          title="Clientes Ativos"
          value={kpis.clientesAtivos}
          icon={Users}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashFlowChart />
        <EntradasSaidasChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Recent OS */}
          <SectionCard
            title="Ordens de Serviço Recentes"
            description="Últimas movimentações do sistema"
            footer={
              <Link
                href="/os"
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              >
                Ver todas
                <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <DataTable
              columns={[
                {
                  key: 'id',
                  label: 'OS',
                  render: (value) => <span className="text-xs font-mono font-medium">{value}</span>,
                },
                {
                  key: 'cliente',
                  label: 'Cliente',
                  render: (value) => <span className="text-xs">{value}</span>,
                },
                {
                  key: 'tipo',
                  label: 'Tipo',
                  className: 'hidden sm:table-cell',
                  render: (value) => <span className="text-xs text-muted-foreground">{value}</span>,
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value) => (
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', STATUS_COLORS[value])}>
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'valor',
                  label: 'Valor',
                  render: (value) => <span className="text-xs font-medium text-right">{value}</span>,
                },
              ]}
              data={recentOrders}
            />
          </SectionCard>
        </div>

        <ExpensesChart />
      </div>
    </div>
  )
}
