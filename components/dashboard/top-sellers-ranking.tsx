'use client'

import { SectionCard } from '@/components/ui'

interface TopSeller {
  id: string
  name: string
  revenue: number
  percentage: number
}

interface TopSellersRankingProps {
  sellers: TopSeller[]
}

export function TopSellersRanking({ sellers }: TopSellersRankingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <SectionCard title="Ranking de Vendedores" description="Performance por vendedor">
      <div className="space-y-3">
        {sellers.map((seller, index) => (
          <div key={seller.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground w-6 text-center">#{index + 1}</span>
                <p className="text-sm font-medium text-foreground">{seller.name}</p>
              </div>
              <p className="text-sm font-semibold text-accent">{formatCurrency(seller.revenue)}</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${seller.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{seller.percentage.toFixed(1)}% da receita</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
