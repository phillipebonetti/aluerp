'use client'

import { MoneyCard, MetricCard } from '@/components/ui'
import { Wallet, TrendingUp, TrendingDown, DollarSign, ClipboardList, HardHat, Users } from 'lucide-react'

interface KPIIndicatorsProps {
  kpis: {
    saldoAtual: number
    entradasMes: number
    saidasMes: number
    lucroMes: number
    osAbertas: number
    obrasAtivas: number
    clientesAtivos: number
    vencidosPending: number
  }
}

export function KPIIndicators({ kpis }: KPIIndicatorsProps) {
  return (
    <div className="space-y-4">
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
          trend={5}
          trendLabel="vs. mês anterior"
        />
        <MoneyCard
          title="Saídas do Mês"
          value={kpis.saidasMes}
          icon={TrendingDown}
          variant="expense"
          trend={-3}
          trendLabel="vs. mês anterior"
        />
        <MoneyCard
          title="Lucro do Mês"
          value={kpis.lucroMes}
          icon={DollarSign}
          variant="income"
          trend={8}
          trendLabel="vs. mês anterior"
        />
      </div>

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
    </div>
  )
}
