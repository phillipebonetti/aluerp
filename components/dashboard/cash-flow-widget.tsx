'use client'

import { SectionCard } from '@/components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CashFlowData {
  month: string
  income: number
  expense: number
  net: number
}

interface CashFlowWidgetProps {
  data: CashFlowData[]
}

export function CashFlowWidget({ data }: CashFlowWidgetProps) {
  return (
    <SectionCard title="Fluxo de Caixa" description="Últimos 12 meses">
      <div className="w-full h-64 -mx-4 -mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: 'var(--color-border)' }} />
            <Legend />
            <Bar dataKey="income" fill="var(--color-success)" name="Entradas" />
            <Bar dataKey="expense" fill="var(--color-destructive)" name="Saídas" />
            <Bar dataKey="net" fill="var(--color-accent)" name="Líquido" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}
