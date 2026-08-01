'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import type { OSDashboardMetrics } from '@/src/types/os'

interface OSDashboardKPIsProps {
  metrics: OSDashboardMetrics
}

export function OSDashboardKPIs({ metrics }: OSDashboardKPIsProps) {
  const kpis = [
    {
      title: 'Total de OS',
      value: metrics.totalOS,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-blue-500/10 text-blue-600',
      description: 'Ordens de serviço criadas',
    },
    {
      title: 'Em Produção',
      value: metrics.osEmProducao,
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-amber-500/10 text-amber-600',
      description: 'Ordens em andamento',
    },
    {
      title: 'Em Instalação',
      value: metrics.osEmInstalacao,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-purple-500/10 text-purple-600',
      description: 'Aguardando instalação',
    },
    {
      title: 'Concluídas',
      value: metrics.osConcluidas,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-green-500/10 text-green-600',
      description: 'Ordens finalizadas',
    },
    {
      title: 'Atrasadas',
      value: metrics.osAtrasadas,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-red-500/10 text-red-600',
      description: 'Vencidas ou em risco',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <div className={`${kpi.color} p-2 rounded-lg`}>{kpi.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface FinancialMetricsProps {
  metrics: OSDashboardMetrics
}

export function OSDashboardFinancialMetrics({ metrics }: FinancialMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valor em Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            R$ {metrics.valorEmProducao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total de OS em produção</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valor em Instalação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            R$ {metrics.valorEmInstalacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total aguardando instalação</p>
        </CardContent>
      </Card>
    </div>
  )
}
