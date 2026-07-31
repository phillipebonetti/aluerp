# Relatórios — Quick Start

## Acesso

```
/relatorios
```

## Dashboard Executivo

Exibe 14 KPIs em tempo real:

**Financeiro (4):**
- Receita Bruta (Verde)
- Lucro Líquido (Verde)
- Margem % (Azul)
- Ticket Médio (Azul)

**Operacional (4):**
- Obras Ativas (Azul)
- Obras Finalizadas (Verde)
- Contas a Receber (Amarelo)
- Contas a Pagar (Vermelho)

## Usar em Componentes

### Exibir KPI Card
```typescript
import { KPICard } from '@/components/reports/kpi-card'

<KPICard
  title="Receita Bruta"
  value="R$ 125.5k"
  subtitle="Período atual"
  variant="success"
  icon={<DollarSign className="w-6 h-6 text-green-600" />}
  trend={15}
/>
```

### Variants
- `default` — Azul (padrão)
- `success` — Verde (positivo)
- `warning` — Amarelo (atenção)
- `danger` — Vermelho (crítico)

## Obter KPIs Programaticamente

```typescript
import { getKPIsAction } from '@/src/actions/reports'

const now = new Date()
const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const result = await getKPIsAction(companyId, startDate, endDate)

if (result.success) {
  console.log('KPIs:', result.data)
  // {
  //   totalRevenue: 125000,
  //   netRevenue: 100000,
  //   profit: 50000,
  //   marginPercentage: 40,
  //   ... mais campos
  // }
}
```

## KPIs Disponíveis

| KPI | Descrição | Fórmula |
|-----|-----------|---------|
| Receita Bruta | Total de entradas | SUM(Income) |
| Receita Líquida | Receita - Despesas | Bruta - Expenses |
| Custos | Total de custos das obras | SUM(ProjectCosts) |
| Lucro | Receita Líquida - Custos | Líquida - Custos |
| Margem % | Lucro sobre receita | (Lucro / Bruta) * 100 |
| Ticket Médio | Receita por oportunidade | Lucro / Oportunidades |
| Obras em Andamento | Contador | COUNT(IN_PROGRESS) |
| Obras Finalizadas | Contador | COUNT(COMPLETED) |
| Contas a Receber | Valores vencidos | SUM(INCOME overdue) |
| Contas a Pagar | Valores vencidos | SUM(EXPENSE overdue) |
| Leads Gerados | Período | COUNT(new leads) |
| Opp Fechadas | Período | COUNT(CLOSED_WON) |
| Taxa Conversão | Leads vs Opp | (Opp / Leads) * 100 |
| Top Sellers | Ranking | ORDER BY value DESC |

## Fluxo de Caixa

```typescript
import { getCashFlowAction } from '@/src/actions/reports'

const result = await getCashFlowAction(companyId, 12)

if (result.success) {
  // Array de 12 meses:
  // [
  //   { month: "Jan/24", income: 50000, expense: 30000, balance: 20000 },
  //   { month: "Feb/24", income: 55000, expense: 32000, balance: 23000 },
  //   ...
  // ]
  
  // Pronto para gráfico:
  <LineChart data={result.data} />
}
```

## Métricas Comerciais

```typescript
import { getCommercialMetricsAction } from '@/src/actions/reports'

const result = await getCommercialMetricsAction(companyId, startDate, endDate)

if (result.success) {
  // {
  //   leadsGenerated: 25,
  //   opportunitiesClosed: 5,
  //   quotesIssued: 12,
  //   conversionRate: 20
  // }
}
```

## Top Sellers

```typescript
import { getTopSellersAction } from '@/src/actions/reports'

const result = await getTopSellersAction(companyId, 10)

if (result.success) {
  // Array de sellers:
  // [
  //   {
  //     id: "emp-123",
  //     name: "João Silva",
  //     leadsGenerated: 15,
  //     opportunitiesClosed: 3,
  //     totalValue: 45000
  //   },
  //   ...
  // ]
}
```

## Filtros Globais

```typescript
import { ReportFilters } from '@/components/reports/report-filters'

<ReportFilters onApply={(filters) => {
  // { period, client, seller, status, city, paymentType, ... }
  console.log('Filtros aplicados:', filters)
}} />
```

## Dashboard Personalizável (Estrutura)

```typescript
import { getDashboardLayoutAction, saveDashboardLayoutAction } from '@/src/actions/reports'

// Obter layout customizado
const layout = await getDashboardLayoutAction(companyId, userId)

// Salvar novo layout
await saveDashboardLayoutAction(companyId, userId, {
  widgets: [
    { id: 'kpi-revenue', position: 0 },
    { id: 'kpi-profit', position: 1 },
    { id: 'chart-cashflow', position: 2 },
    // ... mais widgets
  ],
  columnCount: 3
})
```

## Abas Disponíveis

1. **Dashboard** — KPIs + Relatórios Rápidos (implementado)
2. **Financeiro** — DRE, Fluxo de Caixa, Contas (em desenvolvimento)
3. **Comercial** — Conversão, Vendedores, Clientes (em desenvolvimento)
4. **Obras** — Cronograma, Custos, Performance (em desenvolvimento)

## Exportações (Estrutura Pronta)

```
Botão "Exportar" → Select formato (PDF/EXCEL/CSV)
↓
Gera ReportExport com status PROCESSING
↓
Background job processa
↓
Status muda para COMPLETED
↓
Link para download ativado
↓
Arquivo expira em 7 dias
```

## Agendamentos (Estrutura Pronta)

```
ReportSchedule {
  frequency: DAILY | WEEKLY | MONTHLY
  time: "09:00"
  recipients: ["email@company.com"]
  format: "PDF"
}

Cron job verifica nextScheduled
Se passou → Gera relatório e envia
Atualiza lastSent e nextScheduled
```

## Design Tokens

**Colors:**
- Success (Lucro/Receita): `green-600`
- Warning (Contas Receber): `yellow-600`
- Danger (Contas Pagar): `red-600`
- Default (Outros): `blue-600`

**Cards:**
- Gradient background (subtle)
- Border com cor do variant
- Ícone no canto superior direito
- Valor grande e bold
- Trending indicator opcional

## Troubleshooting

### KPIs aparecem como "—"
- Verificar se companyId está correto
- Verificar se há dados no período selecionado
- Verificar console para erros

### Fluxo de Caixa não mostra 12 meses
- Verificar se há transactions no banco
- Verificar se datas estão corretas

### Filtros não funcionam
- Implementação em desenvolvimento
- Será adicionado na próxima iteração

## Próximos Passos

1. Implementar abas de Relatórios Específicos
2. Adicionar gráficos Recharts
3. Exportações PDF/Excel
4. Agendamentos com cron jobs
5. Dashboard drag-and-drop
