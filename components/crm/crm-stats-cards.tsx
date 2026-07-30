'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CRMStats } from '@/src/modules/crm/types'
import { formatCurrency } from '@/lib/crm/utils'
import {
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Zap,
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
  Briefcase,
  Percent
} from 'lucide-react'

interface CRMStatsCardsProps {
  stats: CRMStats
  period?: string
}

export function CRMStatsCards({ stats, period = 'Este Mês' }: CRMStatsCardsProps) {
  const cards = [
    {
      label: 'Leads cadastrados hoje',
      value: stats.leadsToday || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Leads do mês',
      value: stats.totalLeads,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Oportunidades abertas',
      value: stats.totalOpportunities,
      icon: Target,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Oportunidades perdidas',
      value: stats.lostDeals,
      icon: XCircle,
      color: 'bg-red-100 text-red-600'
    },
    {
      label: 'Negociações em andamento',
      value: stats.negotiationCount || 0,
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Valor em negociação',
      value: formatCurrency(stats.pipelineValue),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Valor vendido no mês',
      value: formatCurrency(stats.closedDealsValue || 0),
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(stats.avgDealValue),
      icon: Briefcase,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      label: 'Taxa de conversão',
      value: `${stats.conversionRate}%`,
      icon: Percent,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      label: 'Tempo médio fechamento',
      value: `${stats.avgClosingDays || 0} dias`,
      icon: Clock,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      label: 'Meta mensal',
      value: formatCurrency(stats.monthlTarget || 0),
      icon: BarChart3,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      label: 'Progresso da meta',
      value: `${stats.goalProgress || 0}%`,
      icon: TrendingUp,
      color: 'bg-lime-100 text-lime-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.slice(0, 12).map((card, idx) => {
          const Icon = card.icon
          const isProgress = card.label.includes('Progresso')
          const progressValue = isProgress ? parseInt(card.value as string) : null

          return (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">{card.label}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              {isProgress && progressValue !== null && (
                <Progress value={progressValue} className="h-1.5" />
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
