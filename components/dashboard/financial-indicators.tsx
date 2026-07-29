'use client'

import { SectionCard } from '@/components/ui'
import { BarChart3, PieChart, Percent } from 'lucide-react'

interface FinancialIndicatorsData {
  totalIncome: number
  totalExpense: number
  profit: number
  margin: number
  expenseRatio: number | string
}

interface FinancialIndicatorsProps {
  indicators: FinancialIndicatorsData
}

export function FinancialIndicators({ indicators }: FinancialIndicatorsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <SectionCard title="Indicadores Financeiros" description="Análise de saúde financeira">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Margem Líquida</p>
          </div>
          <p className="text-2xl font-semibold text-blue-500">{indicators.margin.toFixed(1)}%</p>
        </div>

        <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Despesas</p>
          </div>
          <p className="text-2xl font-semibold text-amber-500">{indicators.expenseRatio}%</p>
          <p className="text-xs text-muted-foreground mt-1">da receita</p>
        </div>

        <div className={`rounded-lg p-4 border ${indicators.profit > 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className={`w-4 h-4 ${indicators.profit > 0 ? 'text-success' : 'text-destructive'}`} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Lucro</p>
          </div>
          <p className={`text-2xl font-semibold ${indicators.profit > 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(indicators.profit)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Receita Total</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(indicators.totalIncome)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Despesa Total</p>
          <p className="text-xl font-semibold text-foreground">{formatCurrency(indicators.totalExpense)}</p>
        </div>
      </div>
    </SectionCard>
  )
}
