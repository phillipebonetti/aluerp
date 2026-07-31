# Dashboard Executivo — Quick Start

## Acesso

```
/dashboard
```

## Componentes Principais

### MetricCard
```typescript
import { MetricCard } from '@/components/dashboard/metric-card'

<MetricCard
  title="Receita"
  value={125000}
  trend={15}
  format="currency" // currency | percentage | number
  variant="success" // default | success | warning | danger
  loading={false}
  icon={<DollarSign className="w-6 h-6 text-green-600" />}
/>
```

### RevenueChart
```typescript
import { RevenueChart } from '@/components/dashboard/revenue-chart'

<RevenueChart data={cashFlowData} />
// Data: { month: string, income: number, expense: number, balance: number }[]
```

### CashFlowChart
```typescript
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'

<CashFlowChart data={cashFlowData} />
```

### EvolutionChart
```typescript
import { EvolutionChart } from '@/components/dashboard/evolution-chart'

<EvolutionChart data={evolutionData} />
// Data: { month: string, income: number, profit: number, costs: number }[]
```

### RankingTable
```typescript
import { RankingTable } from '@/components/dashboard/ranking-table'

<RankingTable
  items={items}
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'value', label: 'Valor', format: 'currency' }
  ]}
  loading={loading}
/>
```

### DueAccountsList
```typescript
import { DueAccountsList } from '@/components/dashboard/due-accounts-list'

<DueAccountsList
  accounts={accounts}
  loading={loading}
/>
// Accounts: { id, name, amount, dueDate, type: 'receive' | 'pay' }[]
```

### DashboardFilterBar
```typescript
import { DashboardFilterBar } from '@/components/dashboard/dashboard-filters'

<DashboardFilterBar
  filters={filters}
  onFilterChange={updateFilters}
  onExport={handleExport}
  onPrint={handlePrint}
  onRefresh={handleRefresh}
/>
```

## Hooks

### useDashboardData
```typescript
import { useDashboardData } from '@/src/hooks/useDashboardData'

const { kpis, cashFlow, metrics, sellers, loading, error, refetch } = useDashboardData(
  companyId,
  { period: '90' }
)
```

### useDashboardFilters
```typescript
import { useDashboardFilters } from '@/src/hooks/useDashboardData'

const { filters, updateFilters } = useDashboardFilters()

updateFilters({ period: '180' })
updateFilters({ clientId: 'client-123' })
```

## Utilities

### Formatação
```typescript
import { formatCurrency, formatPercentage, formatNumber } from '@/src/utils/dashboard'

formatCurrency(125000) // "R$ 125.000,00"
formatPercentage(15.5) // "15.5%"
formatNumber(125000) // "125.000"
```

### Cálculos
```typescript
import { calculateTrend, getTrendColor } from '@/src/utils/dashboard'

const trend = calculateTrend(125000, 100000) // 25
const color = getTrendColor(trend) // "text-green-600"
```

### Datas
```typescript
import { formatDate, formatMonthYear, getDaysUntilDue } from '@/src/utils/dashboard'

formatDate(new Date()) // "30/07/2024"
formatMonthYear(new Date()) // "Jul/24"
getDaysUntilDue("2024-08-05") // 6
```

### Exportação
```typescript
import { exportToPDF, exportToExcel, exportToPNG, printDashboard } from '@/src/utils/export'

await exportToPDF('dashboard', 'dashboard.pdf')
await exportToExcel(data, 'dashboard.xlsx')
await exportToPNG('dashboard', 'dashboard.png')
printDashboard()
```

## Seções do Dashboard

1. **Métricas Principais (6 cards)** — Saldo, Receber, Pagar, Fluxo, Lucro, Faturamento
2. **Evolução Financeira** — Area chart com Receita, Despesa, Saldo
3. **Fluxo de Caixa** — Bar chart com Entradas e Saídas
4. **Evolução Mensal** — Line chart com Receita, Lucro, Custos
5. **Top 10 Clientes** — Tabela de ranking
6. **Top 10 Fornecedores** — Tabela de ranking
7. **Top Obras** — Tabela com margem
8. **Ranking de Vendedores** — Performance comercial
9. **Contas Vencendo** — Lista agrupada por vencimento
10. **Próximos Recebimentos** — Tabela com datas
11. **Meta Mensal** — Progress bar
12. **Indicadores** — 4 cards (Ticket, Margem, Clientes, Obras)

## Filtros

### Períodos Rápidos
- 30 dias
- 90 dias
- 180 dias (6 meses)
- 365 dias (12 meses)

### Filtros Avançados
- Cliente
- Fornecedor
- Status

### Ações
- Atualizar (refetch)
- Imprimir
- Exportar (PDF/Excel/PNG)

## Responsividade

- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3-6 colunas (conforme card)

## Loading States

Todos os componentes mostram skeleton enquanto loading=true:
- MetricCard: Skeleton de 8x32px
- RankingTable: 5 linhas de skeleton
- DueAccountsList: 5 itens de skeleton
- Charts: Skeleton de 64px height

## Dark Mode

Suportado via Tailwind dark: prefix. Cores se adaptam automaticamente.

## Troubleshooting

### Dashboard vazio
- Verificar se há dados no período selecionado
- Verificar companyId correto
- Verificar se banco tem transações

### Gráficos não aparecem
- Verificar data format do data array
- Verificar se Recharts está instalado
- Abrir console para ver erros

### Filtros não persistem
- Verificar se localStorage está habilitado
- Limpar localStorage: `localStorage.clear()`

### Exportação falha
- Verificar se elemento existe no DOM
- Verificar permissões de download
- Tentar outro navegador

## Próximos Passos

1. Integrar dados reais da API
2. Adicionar mais gráficos
3. Implementar drill-down
4. Adicionar alertas
5. Dashboard customizável com drag-and-drop
