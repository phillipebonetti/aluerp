# Estrutura de Componentes - AluERP

## Visão Geral

Componentes organizados por domínio e camada, com índices centralizados para importação simples.

## Estrutura Hierárquica

```
components/
├── index.ts                        # Central export index
│
├── ui/                            # Base UI Components (34 componentes)
│   ├── index.ts
│   ├── button.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   │
│   ├── form-input.tsx            # Form inputs
│   ├── form-select.tsx
│   ├── form-textarea.tsx
│   ├── form-date-picker.tsx
│   ├── form-field.tsx
│   ├── form-section.tsx
│   │
│   ├── data-table.tsx             # Tables
│   ├── data-table-advanced.tsx
│   │
│   ├── modal.tsx                 # Dialogs
│   ├── confirm-dialog.tsx
│   ├── drawer.tsx
│   │
│   ├── metric-card.tsx            # Cards
│   ├── money-card.tsx
│   ├── section-card.tsx
│   ├── loading-card.tsx
│   │
│   ├── empty-state.tsx            # Display
│   ├── loading-state.tsx
│   ├── status-badge.tsx
│   ├── suspense-boundary.tsx
│   │
│   ├── page-header.tsx            # Layout
│   ├── filter-bar.tsx
│   ├── search-bar.tsx
│   ├── list-item.tsx
│   ├── stat-group.tsx
│   │
│   ├── dashboard-chart.tsx
│   └── ... (others)
│
├── layout/                        # Layout Components (3)
│   ├── index.ts
│   ├── app-layout.tsx
│   ├── sidebar.tsx
│   └── header.tsx
│
├── dashboard/                     # Dashboard Components (10)
│   ├── index.ts
│   ├── charts.tsx
│   ├── dashboard-card.tsx
│   ├── alerts-widget.tsx
│   ├── monthly-comparison.tsx
│   ├── kpi-indicators.tsx
│   ├── project-metrics.tsx
│   ├── top-clients-ranking.tsx
│   ├── top-sellers-ranking.tsx
│   ├── cash-flow-widget.tsx
│   └── financial-indicators.tsx
│
├── clientes/                      # Clients Domain Components
│   └── index.ts (placeholder)
│
├── obras/                         # Projects Domain Components
│   └── index.ts (placeholder)
│
├── financeiro/                    # Financial Domain Components
│   ├── index.ts
│   └── (reutiliza de dashboard)
│
├── fornecedores/                  # Suppliers Domain Components
│   └── index.ts (placeholder)
│
├── relatorios/                    # Reports Domain Components
│   └── index.ts (placeholder)
│
├── auth/                          # Authentication Components (3)
│   ├── index.ts
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── onboarding-form.tsx
│
├── forms/                         # Forms Components
│   └── index.ts (re-exports auth forms)
│
├── tables/                        # Table Components
│   └── index.ts (re-exports ui tables)
│
├── dialogs/                       # Dialog Components
│   └── index.ts (re-exports ui dialogs)
│
├── employee/                      # Employee Domain (2)
│   ├── index.ts
│   └── ...
│
├── financial/                     # Financial Features (3)
│   ├── index.ts
│   └── ...
│
├── transaction/                   # Transaction Features (3)
│   ├── index.ts
│   └── ...
│
├── storage/                       # Storage Features (1)
│   ├── index.ts
│   └── ...
│
└── theme-provider.tsx             # Theme
```

## Categorias

### 1. UI Components (`ui/`)

**Base Components (Sem domínio específico)**

Componentes reutilizáveis que podem ser usados em qualquer lugar.

```typescript
import { Button, Input, Badge, Avatar } from '@/components/ui'

// Ou específico
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
```

**Subcategorias:**
- **Base**: Button, Input, Badge, Avatar, Separator, Sheet, Tooltip, Dropdown
- **Display**: EmptyState, LoadingState, SuspenseBoundary
- **Cards**: MetricCard, MoneyCard, SectionCard, LoadingCard
- **Tables**: DataTable, DataTableAdvanced
- **Forms**: FormInput, FormSelect, FormTextarea, FormDatePicker, FormField, FormSection
- **Dialogs**: Modal, ConfirmDialog, Drawer
- **Layout**: PageHeader, FilterBar, SearchBar, ListItem, StatGroup, StatusBadge
- **Charts**: DashboardChart

### 2. Layout Components (`layout/`)

**Estrutura geral da aplicação**

```typescript
import { AppLayout, Sidebar, Header } from '@/components/layout'

export function RootLayout() {
  return (
    <AppLayout>
      <Header />
      <Sidebar />
      {/* conteúdo */}
    </AppLayout>
  )
}
```

### 3. Dashboard Components (`dashboard/`)

**Widgets e visualizações do dashboard**

```typescript
import {
  Charts,
  DashboardCard,
  AlertsWidget,
  KPIIndicators,
  ProjectMetrics,
  TopClientsRanking
} from '@/components/dashboard'

export function Dashboard() {
  return (
    <>
      <KPIIndicators />
      <Charts />
      <TopClientsRanking />
    </>
  )
}
```

### 4. Domain Components

**Componentes específicos de cada domínio**

- `clientes/` - Gestão de clientes
- `obras/` - Gestão de projetos/obras
- `financeiro/` - Gestão financeira
- `fornecedores/` - Gestão de fornecedores
- `relatorios/` - Relatórios

```typescript
// Exemplo (quando implementado)
import { ClientList, ClientForm } from '@/components/clientes'
import { ProjectCard, ProjectTable } from '@/components/obras'
import { TransactionForm } from '@/components/financeiro'
```

### 5. Feature Components

- `auth/` - Autenticação
- `forms/` - Formulários (re-exports)
- `tables/` - Tabelas (re-exports)
- `dialogs/` - Diálogos (re-exports)
- `employee/` - Funcionários
- `financial/` - Financeiro
- `transaction/` - Transações
- `storage/` - Armazenamento

## Padrões de Importação

### Importar do Index (Recomendado)

```typescript
import { Button, Input, FormInput } from '@/components/ui'
import { AppLayout, Sidebar } from '@/components/layout'
import { DashboardCard, Charts } from '@/components/dashboard'
```

### Importar Direto (Se necessário)

```typescript
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
```

### Importar do Index Raiz

```typescript
import { Button, AppLayout, DashboardCard } from '@/components'
```

## Guia de Organização

### Quando Criar Novo Componente

1. **É reutilizável em múltiplos lugares?**
   - SIM → Coloque em `ui/`
   - NÃO → Coloque no domínio específico

2. **É específico de um domínio?**
   - SIM → Coloque em `{dominio}/`
   - NÃO → Coloque em `ui/`

3. **É para layout geral?**
   - SIM → Coloque em `layout/`

4. **É para dashboard?**
   - SIM → Coloque em `dashboard/`

### Estrutura de um Componente

```typescript
'use client'

import { ReactNode } from 'react'
import { cn } from '@/src/lib/utils'

interface ComponentProps {
  children?: ReactNode
  className?: string
  // ... props específicas
}

export function Component({ children, className, ...props }: ComponentProps) {
  return (
    <div className={cn('base-class', className)}>
      {children}
    </div>
  )
}
```

### Exportar no Index

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { MyNewComponent } from './my-new-component'
```

## Benefícios

✅ **Organizado** - Componentes por categoria clara
✅ **Escalável** - Fácil adicionar domínios
✅ **Reutilizável** - Imports simplificados
✅ **Sem Duplicação** - Single source of truth
✅ **Type-safe** - TypeScript completo
✅ **Documentado** - Padrões claros

## Contagem de Componentes

| Categoria      | Quantidade | Status |
|----------------|------------|--------|
| UI             | 34         | ✅ Completo |
| Layout         | 3          | ✅ Completo |
| Dashboard      | 10         | ✅ Completo |
| Auth           | 3          | ✅ Completo |
| Clientes       | -          | ⏳ TODO |
| Obras          | -          | ⏳ TODO |
| Fornecedores   | -          | ⏳ TODO |
| Relatórios     | -          | ⏳ TODO |
| Employee       | 2          | ⏳ Existing |
| Financial      | 3          | ⏳ Existing |
| Transaction    | 3          | ⏳ Existing |
| Storage        | 1          | ⏳ Existing |
| **Total**      | **62+**    | **Expandindo** |

## Próximos Passos

1. Criar componentes específicos para `clientes/`
2. Criar componentes específicos para `obras/`
3. Criar componentes específicos para `fornecedores/`
4. Criar componentes específicos para `relatorios/`
5. Consolidar componentes duplicados
6. Remover imports de paths antigos

## Checklist de Migração

- [ ] Verificar imports antigos em arquivo
- [ ] Usar novo path de imports (ex: `@/components/ui`)
- [ ] Remover paths do tipo `@/components/dashboard/...` se disponível via index
- [ ] Testar compilação
- [ ] Verificar visual em browser

## Suporte

Para adicionar novo componente:
1. Crie arquivo em `components/{categoria}/novo-componente.tsx`
2. Exporte em `components/{categoria}/index.ts`
3. Se UI base, exporte em `components/ui/index.ts`
4. Documente neste arquivo
