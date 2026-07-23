'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cashFlowData, expensesData } from '@/lib/mock-data'
import { useTheme } from 'next-themes'

const formatCurrency = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
  return `R$ ${value}`
}

const CustomTooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

function CustomTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={CustomTooltipStyle}>
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={CustomTooltipStyle}>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <span className="font-medium text-foreground">{payload[0].name}:</span>
        <span className="text-muted-foreground">{payload[0].value}%</span>
      </div>
    </div>
  )
}

export function CashFlowChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Fluxo de Caixa Mensal</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Entradas vs. saídas ao longo do ano</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={cashFlowData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="entradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="saidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltipContent />} />
          <Area
            type="monotone"
            dataKey="entradas"
            name="Entradas"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#entradas)"
          />
          <Area
            type="monotone"
            dataKey="saidas"
            name="Saídas"
            stroke="var(--color-chart-5)"
            strokeWidth={2}
            fill="url(#saidas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EntradasSaidasChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Entradas x Saídas</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Comparativo mensal por período</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={cashFlowData.slice(0, 7)} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltipContent />} />
          <Bar dataKey="entradas" name="Entradas" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="saidas" name="Saídas" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExpensesChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Despesas por Categoria</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribuição percentual do mês</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={expensesData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {expensesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 shrink-0">
          {expensesData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name}</span>
              <span className="text-xs font-medium text-foreground ml-auto pl-2">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
