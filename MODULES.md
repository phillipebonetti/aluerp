# Guia de Desenvolvimento de Módulos

## Estrutura de um Novo Módulo

Cada módulo deve seguir esta estrutura:

```
modules/NomeModulo/
├── types.ts                 ← Tipos do domínio
├── schemas/
│   ├── index.ts
│   └── nome-modulo.ts      ← Zod schemas
├── actions/
│   ├── index.ts
│   ├── create.ts           ← Action "criar"
│   ├── update.ts           ← Action "atualizar"
│   ├── delete.ts           ← Action "deletar"
│   ├── list.ts             ← Action "listar"
│   └── ...
├── hooks/                  ← React hooks (future)
│   └── useNomeModulo.ts
├── api/                    ← Route handlers (future)
│   └── route.ts
├── utils/                  ← Helpers privados
│   └── helpers.ts
└── index.ts                ← Exports públicos
```

---

## Passo a Passo: Criar um Novo Módulo

### 1. Definir Types

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
  createdAt: Date
  updatedAt: Date
}

export type Account = {
  id: string
  companyId: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  createdAt: Date
}
```

### 2. Definir Schemas (Zod)

```typescript
// modules/Financial/schemas/transaction.ts
import { z } from 'zod'

export const CreateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser maior que zero'),
  date: z.date(),
  category: z.string().min(1),
  description: z.string().max(500),
})

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>

export const UpdateTransactionSchema = CreateTransactionSchema.partial()

export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
```

```typescript
// modules/Financial/schemas/index.ts
export * from './transaction'
```

### 3. Implementar Server Actions

```typescript
// modules/Financial/actions/transaction.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { NotFoundError, UnauthorizedError } from '@/core/errors'
import { CreateTransactionSchema, UpdateTransactionSchema } from '../schemas'
import type { Transaction } from '../types'

export async function createTransaction(input: unknown) {
  // 1. Validar entrada
  const data = CreateTransactionSchema.parse(input)

  // 2. Validar autenticação
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  // 3. Conectar banco de dados
  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  // 4. Executar
  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      companyId: user.activeCompanyId,
    },
  })

  // 5. Revalidar cache
  revalidatePath('/financeiro')

  return transaction
}

export async function getTransaction(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      companyId: user.activeCompanyId,
    },
  })

  if (!transaction) throw new NotFoundError('Transação não encontrada')

  return transaction
}

export async function listTransactions(filters?: unknown) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  return await prisma.transaction.findMany({
    where: {
      companyId: user.activeCompanyId,
    },
    orderBy: { date: 'desc' },
  })
}

export async function updateTransaction(id: string, input: unknown) {
  const data = UpdateTransactionSchema.parse(input)
  
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
  })

  revalidatePath('/financeiro')
  return transaction
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  await prisma.transaction.delete({ where: { id } })

  revalidatePath('/financeiro')
}
```

```typescript
// modules/Financial/actions/index.ts
export * from './transaction'
```

### 4. Exportar Públicos

```typescript
// modules/Financial/index.ts
export type * from './types'
export * from './schemas'
export * as TransactionActions from './actions'
```

### 5. Usar na Página

```typescript
// app/(app)/financeiro/page.tsx
'use client'

import { useState } from 'react'
import { TransactionActions } from '@/modules/Financial'
import type { Transaction } from '@/modules/Financial'

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  async function loadTransactions() {
    try {
      const data = await TransactionActions.listTransactions()
      setTransactions(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h1>Financeiro</h1>
      {/* ... */}
    </div>
  )
}
```

---

## Boas Práticas

### ✅ Faça

- [ ] Valide entrada com Zod antes de usar
- [ ] Chame `getCurrentUser()` para autenticação
- [ ] Use `getPrisma()` para banco de dados
- [ ] Chame `revalidatePath()` após mutações
- [ ] Exporte tipos via `types.ts`
- [ ] Use server actions via `'use server'`
- [ ] Trate erros com `@/core/errors`

### ❌ Evite

- [ ] Chamar `Math.random()` ou `Date.now()` diretamente (use banco)
- [ ] Deixar senhas ou tokens em tipos
- [ ] Fazer queries sem validação
- [ ] Importar de outro módulo (apenas tipos)
- [ ] Expor implementação privada via `index.ts`

---

## Exemplo Completo: Módulo "Client"

### 1. Types

```typescript
// modules/Client/types.ts
export type Client = {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  cpfCnpj?: string
  status: 'active' | 'inactive' | 'blocked'
  createdAt: Date
  updatedAt: Date
}
```

### 2. Schemas

```typescript
// modules/Client/schemas/client.ts
import { z } from 'zod'

export const CreateClientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  cpfCnpj: z.string().optional(),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>
```

### 3. Actions

```typescript
// modules/Client/actions/client.ts
'use server'

import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { CreateClientSchema } from '../schemas'

export async function createClient(input: unknown) {
  const data = CreateClientSchema.parse(input)
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  return await prisma.client.create({
    data: {
      ...data,
      companyId: user.activeCompanyId,
    },
  })
}

export async function listClients() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  return await prisma.client.findMany({
    where: { companyId: user.activeCompanyId },
    orderBy: { createdAt: 'desc' },
  })
}
```

### 4. Index

```typescript
// modules/Client/index.ts
export type * from './types'
export * from './schemas'
export * as ClientActions from './actions'
```

---

## Próximos Passos

1. Escolher um módulo (ex: Client)
2. Seguir este guia
3. Adicionar ao Prisma schema
4. Rodar `prisma generate`
5. Testar no preview
6. Pedir review

