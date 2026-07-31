# Estrutura Centralizada de Types - AluERP

## Visão Geral

A estrutura de types foi centralizada em `src/types/` para eliminar duplicação e melhorar a manutenibilidade. Todos os tipos relacionados a cada domínio de negócio estão em um único arquivo.

## Estrutura de Arquivos

```
src/types/
├── index.ts                # Exportações centralizadas
├── usuario.ts             # User, Auth, Roles, Permissions
├── cliente.ts             # Client, Contact, Address
├── obra.ts                # Project, Photo, Document, Cost
├── fornecedor.ts          # Supplier, Contact, Document, Rating
├── orcamento.ts           # Quote, Item, Template
├── os.ts                  # ServiceOrder, Item, Timeline
├── financeiro.ts          # Transaction, Account, Invoice, Report
└── dashboard.ts           # Dashboard, Metrics, Charts, Reports
```

## Domínios de Negócio

### 1. Usuario (`usuario.ts`)
**Tipos de Usuário e Autenticação**

```typescript
import type { User, SessionUser, AuthUser, UserRole } from '@/src/types/usuario'

interface User {
  id: string
  email: string
  name: string
  companyId: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
```

**Tipos inclusos:**
- `User` - Usuário completo
- `AuthUser` - Usuário com permissões
- `SessionUser` - Usuário em sessão
- `CompanyMember` - Membro da empresa
- `Role` - Função/Papel
- `Permission` - Permissão
- `LoginPayload`, `RegisterPayload` - Payloads de autenticação

### 2. Cliente (`cliente.ts`)
**Tipos de Cliente e Contatos**

```typescript
import type { Client, ClientWithRelations, CreateClientPayload } from '@/src/types/cliente'

interface Client {
  id: string
  name: string
  type: 'PESSOA_FISICA' | 'PESSOA_JURIDICA'
  document: string
  email?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
```

**Tipos inclusos:**
- `Client` - Cliente básico
- `ClientContact` - Contato do cliente
- `ClientAddress` - Endereço
- `ClientWithRelations` - Cliente com relações
- `CreateClientPayload`, `UpdateClientPayload` - Payloads
- `ClientFilters`, `ClientStats` - Utilitários

### 3. Obra (`obra.ts`)
**Tipos de Projetos/Obras**

```typescript
import type { Project, ProjectWithRelations, ProjectStatus } from '@/src/types/obra'

interface Project {
  id: string
  clientId: string
  name: string
  status: ProjectStatus
  budget: number
  spent: number
}
```

**Tipos inclusos:**
- `Project` - Projeto básico
- `ProjectPhoto`, `ProjectDocument`, `ProjectCost` - Relacionamentos
- `ProjectWithRelations` - Projeto completo
- `CreateProjectPayload`, `UpdateProjectPayload` - Payloads
- `ProjectFilters`, `ProjectStats` - Utilitários

### 4. Fornecedor (`fornecedor.ts`)
**Tipos de Fornecedores**

```typescript
import type { Supplier, SupplierWithRelations, SupplierCategory } from '@/src/types/fornecedor'

interface Supplier {
  id: string
  name: string
  category: SupplierCategory
  status: SupplierStatus
  rating: number
}
```

**Tipos inclusos:**
- `Supplier` - Fornecedor básico
- `SupplierContact`, `SupplierDocument`, `SupplierRating` - Relacionamentos
- `SupplierWithRelations` - Fornecedor completo
- `CreateSupplierPayload`, `UpdateSupplierPayload` - Payloads
- `SupplierFilters`, `SupplierStats`, `SupplierPerformance` - Utilitários

### 5. Orçamento (`orcamento.ts`)
**Tipos de Orçamentos (Quotes)**

```typescript
import type { Quote, QuoteWithItems, QuoteStatus } from '@/src/types/orcamento'

interface Quote {
  id: string
  number: string
  status: QuoteStatus
  total: number
  source: 'LEAD' | 'CLIENT' | 'PROJECT'
}
```

**Tipos inclusos:**
- `Quote` - Orçamento básico
- `QuoteItem` - Item do orçamento
- `QuoteWithItems` - Orçamento completo
- `CreateQuotePayload`, `UpdateQuotePayload` - Payloads
- `QuoteFilters`, `QuoteStats` - Utilitários
- `QuoteTemplate`, `QuoteEmailPayload` - Utilitários

### 6. OS (`os.ts`)
**Tipos de Ordens de Serviço (Service Orders)**

```typescript
import type { ServiceOrder, ServiceOrderStatus } from '@/src/types/os'

interface ServiceOrder {
  id: string
  number: string
  status: ServiceOrderStatus
  projectId?: string
  clientId?: string
}
```

**Tipos inclusos:**
- `ServiceOrder` - OS básica
- `ServiceOrderItem`, `ServiceOrderAttachment`, `TimeLog` - Relacionamentos
- `ServiceOrderWithRelations` - OS completa
- `CreateServiceOrderPayload`, `UpdateServiceOrderPayload` - Payloads
- `ServiceOrderFilters`, `ServiceOrderStats` - Utilitários
- `OSWorkflow` - Fluxo de estados

### 7. Financeiro (`financeiro.ts`)
**Tipos de Gestão Financeira**

```typescript
import type { Transaction, Account, FinancialStats } from '@/src/types/financeiro'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  category: TransactionCategory
  amount: number
  date: Date
}
```

**Tipos inclusos:**
- `Account` - Conta bancária
- `Transaction` - Transação
- `Invoice` - Nota fiscal
- `RecurringTransaction` - Transação recorrente
- `BankReconciliation` - Reconciliação
- `FinancialStats`, `CashFlowData`, `FinancialReport` - Relatórios

### 8. Dashboard (`dashboard.ts`)
**Tipos de Dashboard e Relatórios**

```typescript
import type { DashboardStats, ChartData } from '@/src/types/dashboard'

interface DashboardStats {
  totalClients: number
  totalProjects: number
  totalIncome: number
  netIncome: number
}
```

**Tipos inclusos:**
- `DashboardCard`, `DashboardStats`, `DashboardMetrics` - Componentes
- `ChartData`, `LineChartData`, `BarChartData`, `PieChartData` - Gráficos
- `DashboardWidget`, `DashboardLayout` - Layout
- `ReportFilters`, `ExportReport` - Relatórios

## Como Importar

### Importação Individual
```typescript
import type { Client } from '@/src/types/cliente'
import type { Quote } from '@/src/types/orcamento'
import type { Transaction } from '@/src/types/financeiro'
```

### Importação do Index
```typescript
import type { Client, Quote, Transaction } from '@/src/types'
```

### Em Componentes React
```typescript
'use client'

import type { Client, ClientFilters } from '@/src/types'

interface ClientListProps {
  clients: Client[]
  onFilterChange: (filters: ClientFilters) => void
}

export function ClientList({ clients, onFilterChange }: ClientListProps) {
  return <div>{/* ... */}</div>
}
```

### Em Services
```typescript
import type { CreateClientPayload, UpdateClientPayload } from '@/src/types'
import { prisma } from '@/src/lib/prisma'

export class ClientService {
  async create(payload: CreateClientPayload) {
    return prisma.client.create({ data: payload })
  }

  async update(id: string, payload: UpdateClientPayload) {
    return prisma.client.update({ where: { id }, data: payload })
  }
}
```

### Em Hooks
```typescript
import type { Client, ClientFilters } from '@/src/types'

interface UseClientsReturn {
  clients: Client[]
  filters: ClientFilters
  loading: boolean
  error?: string
}

export function useClientes(): UseClientsReturn {
  // ...
}
```

## Migração de Tipos Antigos

Se você encontrar tipos antigos em `src/modules/*/types/`, importe do novo local:

### Antes
```typescript
import type { CRMLead } from '@/src/modules/crm/types'
```

### Depois
```typescript
import type { /* Migrar para os types apropriados */} from '@/src/types'
```

## Benefícios

✅ **Centralização** - Todos os tipos em um único lugar
✅ **Sem Duplicação** - Single source of truth
✅ **Manutenibilidade** - Fácil encontrar e atualizar tipos
✅ **Consistência** - Padrão uniforme em toda aplicação
✅ **Type Safety** - 100% TypeScript completo
✅ **Autocompletar** - Intellisense em IDEs

## Checklist de Migração

- [ ] Encontrar todos os tipos antigos espalhados
- [ ] Consolidar em `src/types/`
- [ ] Atualizar imports em toda aplicação
- [ ] Testar type checking: `npx tsc --noEmit`
- [ ] Remover arquivos de types antigos
- [ ] Documentar novos padrões na wiki/docs

## Próximos Passos

1. **Remover tipos antigos** de `src/modules/*/types/`
2. **Atualizar todos os imports** no projeto
3. **Validar com TypeScript** `npx tsc --noEmit`
4. **Adicionar novos tipos** conforme necessário em `src/types/`

## Suporte

Para adicionar novos tipos:
1. Identifique o domínio (ex: Cliente, Obra)
2. Adicione em `src/types/{dominio}.ts`
3. Exporte em `src/types/index.ts`
4. Documente neste arquivo
