# AluERP - Guia Rápido de Arquitetura

## Como Usar a Nova Arquitetura

### 1. Recuperar Dados em uma Página

```typescript
// app/(app)/clientes/page.tsx
import { getAllClients } from '@/src/modules/client/actions'

export default async function ClientesPage() {
  const result = await getAllClients()
  const clients = result.data || []
  
  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

### 2. Usar em um Componente Cliente

```typescript
// components/client-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { getAllClients } from '@/src/modules/client/actions'

export function ClientList() {
  const [clients, setClients] = useState([])
  
  useEffect(() => {
    async function load() {
      const result = await getAllClients()
      if (result.data) setClients(result.data)
    }
    load()
  }, [])
  
  return (
    <ul>
      {clients.map(client => (
        <li key={client.id}>{client.name}</li>
      ))}
    </ul>
  )
}
```

### 3. Criar um Novo Item

```typescript
// Usar em um formulário
'use client'

import { createBudget } from '@/src/modules/orcamentos/actions'

export function BudgetForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const result = await createBudget({
      clientId: formData.get('clientId') as string,
      number: formData.get('number') as string,
      totalValue: parseFloat(formData.get('totalValue') as string),
    })
    
    if (result.error) {
      console.error(result.error)
    } else {
      console.log('Orçamento criado:', result.data)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="clientId" type="text" />
      <input name="number" type="text" />
      <input name="totalValue" type="number" />
      <button type="submit">Criar</button>
    </form>
  )
}
```

### 4. Adicionar Novo Serviço

#### Passo 1: Criar o Service

```typescript
// src/services/myfeature.service.ts

import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class MyFeatureService {
  async getAll(options: RepositoryOptions) {
    return await prisma.myTable.findMany({
      where: { 
        companyId: options.companyId, 
        deletedAt: null 
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(id: string, options: RepositoryOptions) {
    return await prisma.myTable.findFirst({
      where: { 
        id, 
        companyId: options.companyId, 
        deletedAt: null 
      },
    })
  }

  async create(data: any, options: RepositoryOptions) {
    return await prisma.myTable.create({
      data: { ...data, companyId: options.companyId },
    })
  }

  async update(id: string, data: any, options: RepositoryOptions) {
    return await prisma.myTable.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })
  }

  async delete(id: string, options: RepositoryOptions) {
    try {
      await prisma.myTable.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return true
    } catch {
      return false
    }
  }
}
```

#### Passo 2: Registrar no Índice de Services

```typescript
// src/services/index.ts

export { MyFeatureService } from './myfeature.service'

export const createServices = () => ({
  // ...
  myFeature: new MyFeatureService(),
})
```

#### Passo 3: Criar Server Actions

```typescript
// src/modules/myfeature/actions/index.ts

'use server'

import { getCurrentUser } from '@/src/core/auth'
import { MyFeatureService } from '@/services'

export async function getAll() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const service = new MyFeatureService()
    const data = await service.getAll({ companyId: user.companyId })
    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}
```

## Checklist para Novos Recursos

- [ ] Criar Service em `src/services/[feature].service.ts`
- [ ] Registrar Service no índice `src/services/index.ts`
- [ ] Criar Actions em `src/modules/[feature]/actions/index.ts`
- [ ] Testar com autenticação
- [ ] Testar multi-tenant (companyId)
- [ ] Documentar novos métodos

## Padrões Importantes

### ✅ DO (Faça)

```typescript
// ✅ Sempre usar Server Actions
const result = await getClients()

// ✅ Sempre verificar erro
if (result.error) { ... }

// ✅ Sempre passar companyId
new ClientService().getAll({ companyId: user.companyId })

// ✅ Sempre usar soft delete
data: { deletedAt: new Date() }
```

### ❌ DON'T (Não Faça)

```typescript
// ❌ Nunca query direta do componente
supabase.from('clients').select('*')

// ❌ Nunca assume sucesso
const data = result.data

// ❌ Nunca esqueça companyId
prisma.client.findMany()

// ❌ Nunca hard delete
prisma.client.delete()
```

## Troubleshooting

**P: Como fazer uma query personalizada?**  
R: Adicione um método ao Service. Nunca faça query direta no componente.

**P: Como testar sem autenticação?**  
R: Use `getCurrentUser()` mock nos testes. Nunca desabilite autenticação em produção.

**P: Como lidar com dados sensíveis?**  
R: Filtre no Service antes de retornar. Nunca retorne dados sensíveis do cliente.

**P: Como otimizar queries?**  
R: Aumente a query no Service. Use includes do Prisma. Implemente caching se necessário.

## Recursos

- [ARCHITECTURE_REFACTORING_GUIDE.md](./ARCHITECTURE_REFACTORING_GUIDE.md) - Documentação completa
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Resumo da refatoração
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Documentação geral do projeto

---

**Última atualização:** 30/07/2026
