# Arquitetura do AluERP

## Princípios

- **Pragmático:** manter o que funciona, evolir o que é novo
- **Modular:** cada domínio de negócio é independente
- **Escalável:** crescer sem refatorar o passado
- **Type-safe:** TypeScript total, Prisma + Supabase
- **Dual-mode:** Preview (sem DB) + Production (com Supabase)

---

## Estrutura de Pastas

```
project-root/
├── app/                     ← Next.js App Router (NÃO alterar)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   └── (app)/
│       ├── dashboard/
│       ├── financeiro/
│       ├── clientes/
│       ├── obras/
│       └── ... (módulos futuros)
│
├── components/              ← Componentes legados (manter como está)
│   ├── auth/
│   ├── layout/
│   ├── dashboard/
│   └── ui/
│
├── lib/                     ← Utilitários legados (manter como está)
│   ├── utils.ts
│   ├── constants.ts
│   ├── mock-data.ts
│   └── ...
│
├── core/                    ← NOVO: Infraestrutura compartilhada
│   ├── auth/                ← Autenticação (auth.ts, preview-session.ts, etc)
│   ├── database/            ← Prisma e tipagem (prisma.ts)
│   ├── supabase/            ← Cliente Supabase (server.ts, client.ts)
│   ├── config/              ← Configurações (env.ts, constants.ts)
│   ├── permissions/         ← RBAC e autorização (future)
│   ├── errors/              ← Tratamento de erros (future)
│   ├── logger/              ← Logging estruturado (future)
│   └── types.ts             ← Tipos compartilhados
│
├── modules/                 ← NOVO: Domínios de negócio
│   ├── Auth/                ← Autenticação (actions, schemas, types)
│   │   ├── actions/
│   │   ├── schemas/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── Company/             ← Empresa/Tenant
│   ├── User/                ← Usuários
│   ├── Client/              ← Clientes
│   ├── Supplier/            ← Fornecedores
│   ├── Project/             ← Obras/Projetos
│   ├── Quote/               ← Orçamentos
│   ├── Financial/           ← Financeiro
│   ├── ServiceOrder/        ← Ordens de Serviço
│   ├── Schedule/            ← Agenda
│   ├── Invoice/             ← Notas Fiscais
│   ├── Report/              ← Relatórios
│   ├── Notification/        ← Notificações
│   ├── Audit/               ← Auditoria
│   └── AI/                  ← IA/ML
│
├── middleware.ts            ← Next.js middleware (NÃO alterar)
├── middleware.auth.ts       ← Middleware de auth (future)
├── prisma/
│   └── schema.prisma
├── public/
├── ...
```

---

## Regras de Organização

### 1. **Core/** - Infraestrutura Compartilhada

Responsável por plumbing técnico, nunca lógica de negócio.

```
core/auth/
  ├── index.ts              ← Exports públicos
  ├── auth.ts               ← getSession(), getCurrentUser()
  ├── preview-session.ts    ← Mock em preview
  ├── preview-store.ts      ← In-memory data store
  └── types.ts              ← AppSession, User, etc
```

**Quem importa:** `lib/actions/`, `modules/Auth`, `app/`, middleware

**Nunca expõe:** lógica de CRUD, business rules, models complexos

---

### 2. **Modules/** - Domínios de Negócio

Cada módulo é auto-contido com tudo necessário para seu domínio.

```
modules/Financial/
  ├── actions/
  │   ├── index.ts
  │   ├── transactions.ts   ← Server actions para CRUD
  │   ├── reports.ts
  │   └── ...
  ├── schemas/
  │   ├── index.ts
  │   └── financial.ts      ← Zod schemas para validação
  ├── types.ts              ← Types do domínio
  ├── hooks/                ← React hooks (future)
  │   └── useFinancial.ts
  ├── api/                  ← Route handlers (future)
  │   ├── route.ts
  │   └── ...
  └── index.ts              ← Export tudo que é público
```

**Quem importa:** Pages em `app/`, componentes que usam o módulo

**Nunca importa de:** outros módulos (exceto tipos via `@/modules/Other/types`)

**Comunica com:** `core/` apenas (database, auth, config)

---

### 3. **Legacy Code** - O que Existe Hoje

```
components/          ← Mantém como está
  ├── auth/
  ├── layout/
  ├── dashboard/
  └── ui/

lib/                 ← Mantém como está
  ├── auth.ts        (será refatorado para core/auth/ aos poucos)
  ├── utils.ts
  ├── constants.ts
  ├── mock-data.ts
  └── actions/

app/                 ← Páginas atuais funcionam normalmente
```

**Migração gradual:** conforme modificar um arquivo legado, move-o para `core/` ou `modules/`

---

## Exemplo: Novo Módulo "Financial"

```typescript
// modules/Financial/types.ts
export type Transaction = {
  id: string
  companyId: string
  type: 'income' | 'expense'
  amount: number
  date: Date
  category: string
  description: string
  status: 'pending' | 'completed' | 'cancelled'
}

export type FinancialFilters = {
  type?: Transaction['type']
  category?: string
  dateFrom?: Date
  dateTo?: Date
}
```

```typescript
// modules/Financial/schemas/financial.ts
import { z } from 'zod'

export const TransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  date: z.date(),
  category: z.string(),
  description: z.string().max(500),
})

export type TransactionInput = z.infer<typeof TransactionSchema>
```

```typescript
// modules/Financial/actions/transactions.ts
'use server'

import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { TransactionSchema } from '../schemas/financial'

export async function createTransaction(data: unknown) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = TransactionSchema.parse(data)
  const prisma = await getPrisma()
  if (!prisma) {
    // Preview mode: usar in-memory store
    // Implementar lógica
  }

  return await prisma.transaction.create({
    data: {
      ...parsed,
      companyId: user.activeCompanyId,
    },
  })
}

export async function listTransactions(filters: unknown) {
  // Similar: getCurrentUser() → query Prisma → return
}
```

```typescript
// modules/Financial/index.ts
export * from './types'
export * from './schemas/financial'
export * as TransactionActions from './actions/transactions'
```

```typescript
// app/(app)/financeiro/page.tsx
import { TransactionActions } from '@/modules/Financial'

export default function FinanceiroPage() {
  // Component code using TransactionActions.listTransactions()
}
```

---

## Imports Padrão

### ✅ Correto

```typescript
// Em qualquer arquivo
import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { TransactionActions } from '@/modules/Financial'
import type { Transaction } from '@/modules/Financial'
```

### ❌ Incorreto

```typescript
// Nunca cruzar módulos
import { createClient } from '@/modules/Quote' // ❌ Módulo importando outro módulo

// Nunca expor implementação
import { previewStore } from '@/core/auth/preview-store' // ❌ Use as exported APIs

// Nunca importar do legacy sem motivo
import { legacyFunc } from '@/lib/auth' // ❌ Prefira @/core/auth
```

---

## Próximas Etapas

1. **Fase 1 (agora):** Criar estrutura base (folders, documentação) ✓
2. **Fase 2:** Gradualmente mover `lib/auth.ts` → `core/auth/`
3. **Fase 3:** Implementar primeiro módulo completo (ex: Clientes)
4. **Fase 4:** Refatorar ações atuais para `modules/*/actions/`
5. **Fase 5:** Adicionar `core/permissions/` para RBAC
6. **Fase 6:** Escalabilidade (caching, async queues, workers)

---

## Desenvolvendo um Novo Módulo

1. Criar pasta em `modules/NomeModulo/`
2. Definir types em `types.ts`
3. Definir Zod schemas em `schemas/`
4. Implementar server actions em `actions/`
5. Criar `index.ts` exportando APIs públicas
6. Usar em pages ou componentes via imports limpos
7. Nunca importar de outro módulo (apenas tipos)

---

## Perguntas Frequentes

**P: Posso mover um arquivo legado agora?**
R: Sim, se fizer sentido e não quebrar nada. Teste após mover.

**P: Posso criar um novo módulo dentro de outro?**
R: Não. Cada módulo é de primeiro nível em `modules/`.

**P: Preciso de uma pasta `utils/` no módulo?**
R: Pode criar, mas mantenha privada. Exporte apenas via `index.ts`.

**P: Como testo um módulo?**
R: `__tests__/` ou `.test.ts` no mesmo diretório do código.

**P: Preciso de database migrations agora?**
R: Não. O Prisma schema e as migrations vêm depois que conectar Supabase.

