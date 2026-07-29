'use client'

import { SectionCard, ListItem } from '@/components/ui'
import { Trophy } from 'lucide-react'

interface TopClient {
  clientId: string
  totalRevenue: number
  client: { name: string }
}

interface TopClientsRankingProps {
  clients: TopClient[]
}

export function TopClientsRanking({ clients }: TopClientsRankingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)

  return (
    <SectionCard title="Ranking de Clientes" description="Top 5 clientes por faturamento">
      <div className="space-y-2">
        {clients.map((client, index) => (
          <div key={client.clientId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{client.client.name}</p>
              <p className="text-xs text-muted-foreground">
                {totalRevenue > 0 && `${((client.totalRevenue / totalRevenue) * 100).toFixed(1)}% do total`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatCurrency(client.totalRevenue || 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
