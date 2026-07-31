# Dashboard BI — Quick Reference

## Componentes em 30 Segundos

### KPI Card - Exibir métrica com trend
```typescript
<KPICard
  title="Receita Mensal"
  value={15000}
  prefix="R$"
  trend={{ value: 12, direction: 'UP' }}
  color="success"
  icon={<TrendingUp />}
/>
```

### Chart Card - Wrapper para gráfico
```typescript
<ChartCard title="Receita vs Despesa">
  <RevenueExpenseChart data={chartData} />
</ChartCard>
```

### Progress Card - Barra de progresso com meta
```typescript
<ProgressCard
  title="Meta de Receita"
  target={50000}
  current={35000}
  color="info"
/>
```

### Ranking Card - Top 5/10 itens
```typescript
<RankingCard
  title="Top Clientes"
  items={topClients}
  limit={10}
  suffix="R$"
/>
```

### Alert Card - Alertas inteligentes
```typescript
<AlertCard
  title="Receita abaixo"
  message="Sua receita caiu 20% vs período anterior"
  severity="warning"
  action={{ label: 'Ver relatório', onClick: () => {} }}
/>
```

---

## Gráficos em 30 Segundos

### Revenue vs Expense
```typescript
<RevenueExpenseChart
  data={[
    { month: 'Jan', revenue: 10000, expense: 5000, profit: 5000 },
    // ...
  ]}
/>
```

### Cash Flow
```typescript
<CashFlowChart
  data={[
    { date: '2024-01', inflow: 10000, outflow: 5000, balance: 5000 },
    // ...
  ]}
/>
```

### Category Breakdown
```typescript
<CategoryBreakdownChart
  data={[
    { name: 'Salários', value: 50000 },
    { name: 'Aluguel', value: 10000 },
    // ...
  ]}
/>
```

---

## Filtros em 30 Segundos

### Date Range Filter
```typescript
const [dateRange, setDateRange] = useState<DateRange>()

<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
/>

// Usar dateRange para filtrar dados
```

---

## Cálculos em 30 Segundos

### Calcular lucro
```typescript
const lucro = calculateProfit(receita, despesa)
```

### Calcular margem
```typescript
const margin = calculateProfitMargin(lucro, receita) // %
```

### Calcular conversão
```typescript
const taxa = calculateConversionRate(aprovados, total) // %
```

### Calcular crescimento
```typescript
const { value, direction } = calculateGrowth(atual, anterior)
// { value: 15, direction: 'UP' }
```

### Gerar alertas automáticos
```typescript
const alerts = generateAlerts({
  monthlyRevenue: 8000,
  accountsPayable: 5000,
  // ...
})
```

### Formatar valores
```typescript
formatCurrency(15000) // "R$ 15.000,00"
formatPercentage(12.5) // "12,5%"
formatNumber(15000) // "15.000"
```

---

## Estrutura Recomendada do Dashboard

```typescript
'use client'

import { useState } from 'react'
import { DateRangeFilter, DateRange } from '@/components/dashboard/date-range-filter'
import { KPICard } from '@/components/dashboard/kpi-card'
import { RevenueExpenseChart } from '@/components/dashboard/charts/revenue-expense-chart'
// ... outros imports

export default function DashboardPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRange>()
  
  // Data - integrar com sua API/service
  const kpis = useKPIs(dateRange)
  const charts = useChartData(dateRange)
  
  // Render
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Receita Mensal" value={kpis.revenue} />
        <KPICard title="Despesa Mensal" value={kpis.expense} />
        <KPICard title="Lucro Mensal" value={kpis.profit} />
        <KPICard title="Fluxo de Caixa" value={kpis.cashFlow} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueExpenseChart data={charts.revenueExpense} />
        <CashFlowChart data={charts.cashFlow} />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankingCard title="Top Clientes" items={charts.topClients} />
        <RankingCard title="Top Obras" items={charts.topProjects} />
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} {...alert} />
        ))}
      </div>
    </div>
  )
}
```

---

## Integração com Dados Reais

### 1. Criar Server Action para dados
```typescript
// src/actions/dashboard.ts
'use server'

export async function getDashboardData(dateRange: DateRange) {
  // Fetch dados do banco
  // Calcular KPIs
  // Formatar para componentes
  return { kpis, charts, alerts }
}
```

### 2. Usar em componente
```typescript
'use client'

const dashboardData = await getDashboardData(dateRange)

<KPICard
  title="Receita Mensal"
  value={dashboardData.kpis.monthlyRevenue}
  trend={{ value: 12, direction: 'UP' }}
/>
```

---

## Cores por Severidade/Status

| Tipo | Classe | Uso |
|------|--------|-----|
| Success | `bg-green-50` / `text-green-600` | KPI crescendo, meta atingida |
| Warning | `bg-amber-50` / `text-amber-600` | Alerta moderado, queda |
| Danger | `bg-red-50` / `text-red-600` | Erro, valor negativo |
| Info | `bg-blue-50` / `text-blue-600` | Informação, neutro |

---

## Performance Tips

1. **Memoize** tudo que é passado como prop
2. **Use lazy loading** para charts pesados
3. **Cache** dados com SWR ou React Query
4. **Virtualize** listas com 100+ itens
5. **Debounce** filtros

---

## Troubleshooting

**Q: Gráfico não renderiza?**
- Verificar se data não está vazia
- Verificar se ResizeContainer tem parent com height definida
- Verificar console para erros do Recharts

**Q: KPI não atualiza?**
- Verificar se hook atualiza com dateRange
- Verificar se useMemo depende do dateRange

**Q: Alertas não aparecem?**
- Rodar `generateAlerts(metrics)`
- Verificar se os alertas estão sendo retornados (console.log)

---

## Extensões Futuras

- [ ] Exportar PDF/Excel
- [ ] Modo TV (auto-refresh)
- [ ] Personalizar layout (drag-drop)
- [ ] Real-time updates (WebSocket)
- [ ] Comparativo de períodos
- [ ] Previsão (forecast)
- [ ] Heatmap financeiro
- [ ] Calendário financeiro

---

## Arquivos Principais

```
components/dashboard/
├── kpi-card.tsx
├── chart-card.tsx
├── progress-card.tsx
├── ranking-card.tsx
├── alert-card.tsx
├── comparison-card.tsx
├── trend-icon.tsx
├── date-range-filter.tsx
└── charts/
    ├── revenue-expense-chart.tsx
    ├── cash-flow-chart.tsx
    └── category-breakdown-chart.tsx

src/lib/
└── financial-metrics.ts
```

