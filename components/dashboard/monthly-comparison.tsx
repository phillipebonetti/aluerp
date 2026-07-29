'use client'

import { SectionCard } from '@/components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MonthlyComparisonProps {
  data: {
    currentMonth: number
    lastMonth: number
    variation: number
    status: 'positive' | 'negative' | 'neutral'
  }
}

export function MonthlyComparison({ data }: MonthlyComparisonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <SectionCard title="Comparativo Mensal" description="Receita do mês atual vs anterior">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Mês Atual</p>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(data.currentMonth)}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Mês Anterior</p>
          <p className="text-2xl font-semibold text-foreground">{formatCurrency(data.lastMonth)}</p>
        </div>

        <div className={`rounded-lg p-4 ${data.status === 'positive' ? 'bg-success/10' : data.status === 'negative' ? 'bg-destructive/10' : 'bg-muted/30'}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Variação</p>
          <div className="flex items-center gap-2">
            {data.status === 'positive' && <TrendingUp className="w-5 h-5 text-success" />}
            {data.status === 'negative' && <TrendingDown className="w-5 h-5 text-destructive" />}
            <p className={`text-2xl font-semibold ${data.status === 'positive' ? 'text-success' : data.status === 'negative' ? 'text-destructive' : 'text-foreground'}`}>
              {data.variation > 0 ? '+' : ''}{data.variation.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
