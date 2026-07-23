import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { CashFlowChart, EntradasSaidasChart, ExpensesChart } from '@/components/dashboard/charts'
import { recentOrders } from '@/lib/mock-data'
import { STATUS_COLORS } from '@/lib/constants'
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

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do desempenho da sua empresa.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Saldo Atual"
          value="R$ 0,00"
          icon={Wallet}
          variant="default"
          description="Conta corrente"
        />
        <DashboardCard
          title="Entradas do Mês"
          value="R$ 0,00"
          icon={TrendingUp}
          variant="positive"
          trend={0}
          trendLabel="vs. mês anterior"
        />
        <DashboardCard
          title="Saídas do Mês"
          value="R$ 0,00"
          icon={TrendingDown}
          variant="negative"
          trend={0}
          trendLabel="vs. mês anterior"
        />
        <DashboardCard
          title="Lucro do Mês"
          value="R$ 0,00"
          icon={DollarSign}
          variant="positive"
          trend={0}
          trendLabel="vs. mês anterior"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
            <ClipboardList className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">OS Abertas</p>
            <p className="text-2xl font-semibold text-foreground">0</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10">
            <HardHat className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Obras Ativas</p>
            <p className="text-2xl font-semibold text-foreground">0</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10">
            <Users className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes Ativos</p>
            <p className="text-2xl font-semibold text-foreground">0</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashFlowChart />
        <EntradasSaidasChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Recent OS */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Ordens de Serviço Recentes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Últimas movimentações do sistema</p>
              </div>
              <Link
                href="/os"
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              >
                Ver todas
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">OS</th>
                    <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">Cliente</th>
                    <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">Tipo</th>
                    <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">Status</th>
                    <th className="text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono font-medium text-foreground">{order.id}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-foreground">{order.cliente}</span>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{order.tipo}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                            STATUS_COLORS[order.status]
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs font-medium text-foreground">{order.valor}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ExpensesChart />
      </div>
    </div>
  )
}
