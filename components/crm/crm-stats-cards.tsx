'use client'

import { Card } from '@/components/ui/card'
import type { CRMStats } from '@/src/modules/crm/types'
import { formatCurrency } from '@/lib/crm/utils'
import { TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react'

interface CRMStatsCardsProps {
  stats: CRMStats
}

export function CRMStatsCards({ stats }: CRMStatsCardsProps) {
  const cards = [
    {
      label: 'Leads Totais',
      value: stats.totalLeads,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Oportunidades',
      value: stats.totalOpportunities,
      icon: Target,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(stats.totalPipelineValue),
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      icon: CheckCircle2,
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card key={idx} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`p-2 rounded ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
