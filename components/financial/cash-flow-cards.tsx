'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import type { CashFlowSummary } from '@/src/types/financial'

interface CashFlowCardsProps {
  data: CashFlowSummary | null
  isLoading: boolean
}

export function CashFlowCards({ data, isLoading }: CashFlowCardsProps) {
  if (isLoading) {
    return <div className="grid grid-cols-6 gap-4 animate-pulse" />
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
  }

  const cardData = [
    {
      label: 'Saldo Atual',
      value: data.currentBalance,
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
      trend: null,
    },
    {
      label: 'Entradas do Mês',
      value: data.monthlyInflow,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      trend: 'up',
    },
    {
      label: 'Saídas do Mês',
      value: data.monthlyOutflow,
      icon: TrendingDown,
      color: 'bg-red-50 text-red-600',
      trend: 'down',
    },
    {
      label: 'Lucro do Mês',
      value: data.monthlyProfit,
      icon: DollarSign,
      color: data.monthlyProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
      trend: data.monthlyProfit >= 0 ? 'up' : 'down',
    },
    {
      label: 'A Receber',
      value: data.accountsReceivable,
      icon: TrendingUp,
      color: 'bg-yellow-50 text-yellow-600',
      trend: null,
    },
    {
      label: 'A Pagar',
      value: data.accountsPayable,
      icon: AlertCircle,
      color: 'bg-orange-50 text-orange-600',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {cardData.map((card, index) => (
        <Card key={index} className={`p-4 ${card.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold mt-2">
                R$ {card.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <card.icon className="h-8 w-8 opacity-20" />
          </div>
        </Card>
      ))}
    </div>
  )
}
