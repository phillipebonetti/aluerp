import { getDashboardData } from '@/src/modules/dashboard/actions'
import { KPIIndicators } from '@/components/dashboard/kpi-indicators'
import { MonthlyComparison } from '@/components/dashboard/monthly-comparison'
import { AlertsWidget } from '@/components/dashboard/alerts-widget'
import { TopClientsRanking } from '@/components/dashboard/top-clients-ranking'
import { TopSellersRanking } from '@/components/dashboard/top-sellers-ranking'
import { ProjectMetrics } from '@/components/dashboard/project-metrics'
import { FinancialIndicators } from '@/components/dashboard/financial-indicators'
import { CashFlowWidget } from '@/components/dashboard/cash-flow-widget'
import { SectionCard } from '@/components/ui'
import { recentOrders } from '@/lib/mock-data'
import { STATUS_COLORS } from '@/src/core/config/constants'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const dashboardResult = await getDashboardData()
  const dashboard = dashboardResult.data || {
    kpis: {},
    recentOrders: [],
    recentTransactions: [],
    topClients: [],
    overduePendingTransactions: [],
    cashFlow: [],
    monthlyComparison: {},
    alerts: [],
    topSellers: [],
    projectMetrics: {},
    financialIndicators: {},
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do desempenho da sua empresa.</p>
      </div>

      {/* KPI Indicators */}
      <KPIIndicators kpis={dashboard.kpis} />

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

      {/* Alerts and Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsWidget alerts={dashboard.alerts} />
        <MonthlyComparison data={dashboard.monthlyComparison} />
      </div>

      {/* Financial and Project Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinancialIndicators indicators={dashboard.financialIndicators} />
        <ProjectMetrics metrics={dashboard.projectMetrics} />
      </div>

      {/* Cash Flow Analysis */}
      <CashFlowWidget data={dashboard.cashFlow} />

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopClientsRanking clients={dashboard.topClients} />
        <TopSellersRanking sellers={dashboard.topSellers} />
      </div>

      {/* Recent Orders */}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">OS</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Cliente</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Status</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Valor</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any, i: number) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <td className="px-4 py-3 text-xs font-mono">{order.id}</td>
                  <td className="px-4 py-3 text-xs">{order.cliente}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{order.tipo}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-right">{order.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
