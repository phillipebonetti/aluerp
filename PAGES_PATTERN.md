# Padrão de Páginas - AluERP

## Princípio Fundamental

**Páginas contêm APENAS:**
- Renderização (JSX)
- Chamadas de hooks
- Componentes

**Páginas NÃO contêm:**
- Lógica de negócio
- Chamadas diretas a APIs
- Cálculos complexos
- Validações
- Transformação de dados

## Estrutura Padrão

### ❌ ERRADO - Lógica na página

```typescript
// app/(app)/clientes/page.tsx - ❌ NÃO FAÇA
'use client'

import { useState, useEffect } from 'react'
import { prisma } from '@/src/lib/prisma'

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ❌ Lógica de negócio aqui
    (async () => {
      const data = await prisma.client.findMany({
        where: { status: 'ACTIVE' }
      })
      setClients(data)
      setLoading(false)
    })()
  }, [])

  // ❌ Transformação de dados
  const formattedClients = clients.map(c => ({
    ...c,
    displayName: `${c.name} (${c.document})`
  }))

  return (
    <div>
      {loading ? <p>Carregando...</p> : (
        <ClientList clients={formattedClients} />
      )}
    </div>
  )
}
```

### ✅ CORRETO - Apenas renderização

```typescript
// app/(app)/clientes/page.tsx - ✅ CORRETO
'use client'

import { useClientes } from '@/src/hooks'
import { ClientsPage as ClientsPageComponent } from '@/components/clientes'

export default function ClientesPage() {
  // Apenas hooks
  const { clients, loading, error } = useClientes()

  // Apenas renderização
  return (
    <ClientsPageComponent
      clients={clients}
      loading={loading}
      error={error}
    />
  )
}
```

## Estrutura de Camadas

```
Page (renderização)
  ↓
Componentes (UI)
  ↓
Hooks (estado + lógica leve)
  ↓
Services/Actions (lógica de negócio)
  ↓
API Routes (comunicação)
  ↓
Database (persistência)
```

## Exemplos por Tipo de Página

### 1. Página de Lista (Com Filtros)

```typescript
// app/(app)/clientes/page.tsx - ✅ CORRETO
'use client'

import { ClientsListPage } from '@/components/clientes'
import { useClientes } from '@/src/hooks'
import { useState } from 'react'

export default function ClientesPage() {
  // Estado local de filtros
  const [filters, setFilters] = useState()

  // Dados via hook
  const { clients, loading } = useClientes(filters)

  // Renderizar componente
  return (
    <ClientsListPage
      clients={clients}
      loading={loading}
      filters={filters}
      onFilterChange={setFilters}
    />
  )
}
```

### 2. Página de Detalhe

```typescript
// app/(app)/clientes/[id]/page.tsx - ✅ CORRETO
'use client'

import { ClientDetailPage } from '@/components/clientes'
import { useCliente } from '@/src/hooks'

interface PageProps {
  params: { id: string }
}

export default function ClienteDetailPage({ params }: PageProps) {
  // Fetch via hook
  const { cliente, loading, update, delete: deleteClient } = useCliente(params.id)

  // Renderizar
  return (
    <ClientDetailPage
      client={cliente}
      loading={loading}
      onUpdate={update}
      onDelete={deleteClient}
    />
  )
}
```

### 3. Página de Criação/Edição

```typescript
// app/(app)/clientes/novo/page.tsx - ✅ CORRETO
'use client'

import { ClientFormPage } from '@/components/clientes'
import { useCreateClient } from '@/src/hooks'
import { useRouter } from 'next/navigation'

export default function NovoClientePage() {
  const router = useRouter()
  const { create, loading } = useCreateClient()

  const handleSubmit = async (data) => {
    const result = await create(data)
    if (result) router.push('/clientes')
  }

  return (
    <ClientFormPage
      loading={loading}
      onSubmit={handleSubmit}
    />
  )
}
```

### 4. Página Server-Side (Sem 'use client')

```typescript
// app/(app)/dashboard/page.tsx - ✅ CORRETO (Server)
import { DashboardPage } from '@/components/dashboard'
import { getDashboardData } from '@/src/services/dashboard'

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard principal'
}

export default async function DashboardPageServer() {
  // Lógica de negócio em função server (getDashboardData)
  const { data, error } = await getDashboardData()

  // Renderizar componente
  return <DashboardPage data={data} error={error} />
}
```

## Checklist para Criar Página

- [ ] Página tem 'use client' ou é Server Component?
- [ ] Página importa apenas hooks e componentes?
- [ ] Página não tem lógica de API?
- [ ] Transformação de dados está em hook ou componente?
- [ ] Validações estão em utils ou services?
- [ ] Estado compartilhado usa Context + Hooks?
- [ ] Metadata está configurada (título, descrição)?
- [ ] Tratamento de erro está delegado ao componente?

## Estrutura de Pastas Esperada

```
app/(app)/
├── clientes/
│   ├── page.tsx              ← Renderização
│   ├── [id]/
│   │   └── page.tsx          ← Renderização (detalhe)
│   ├── novo/
│   │   └── page.tsx          ← Renderização (criar)
│   └── layout.tsx            ← Layout específico
│
├── obras/
│   └── page.tsx              ← Renderização
│
└── dashboard/
    └── page.tsx              ← Renderização
```

## Onde Colocar Cada Tipo de Código

| Tipo | Onde | Por quê |
|------|------|--------|
| Lógica de negócio | `src/services/` ou `src/modules/` | Reutilizável, testável |
| State management | `src/hooks/` ou `src/contexts/` | Isolado, reativo |
| Validação | `src/utils/validations/` | Reutilizável |
| Transformação | `src/utils/formatters/` ou hooks | Reutilizável |
| API calls | `src/api/` routes | Centralizado |
| Renderização | `components/` | UI apenas |
| **Orquestração** | `src/hooks/use*.ts` | Coordena estado + lógica |

## Exemplo Completo: Feature de Clientes

### 1. Service (Lógica de Negócio)

```typescript
// src/services/client-service.ts
export class ClientService {
  async list(filters?: ClientFilters): Promise<Client[]> {
    // Lógica de negócio aqui
    const query = new ClientQuery()
    if (filters?.status) query.byStatus(filters.status)
    return query.execute()
  }

  async create(data: CreateClientPayload): Promise<Client> {
    // Validação
    validateClient(data)
    
    // Transformação
    const payload = transformClientPayload(data)
    
    // Persistência
    return this.save(payload)
  }
}
```

### 2. Hook (Orquestração)

```typescript
// src/hooks/useClientes.ts
'use client'

export function useClientes(filters?: ClientFilters) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const service = new ClientService()
        const data = await service.list(filters)
        setClients(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters])

  return { clients, loading }
}
```

### 3. Componente (UI)

```typescript
// components/clientes/ClientsList.tsx
'use client'

interface ClientsListProps {
  clients: Client[]
  loading: boolean
  onSelect: (client: Client) => void
}

export function ClientsList({ clients, loading, onSelect }: ClientsListProps) {
  return (
    <div>
      {loading && <Spinner />}
      {clients.map(c => (
        <ClientCard key={c.id} client={c} onClick={() => onSelect(c)} />
      ))}
    </div>
  )
}
```

### 4. Página (Orquestração)

```typescript
// app/(app)/clientes/page.tsx - ✅ CORRETO
'use client'

import { ClientsListPage } from '@/components/clientes'
import { useClientes } from '@/src/hooks'

export default function ClientesPage() {
  const { clients, loading } = useClientes()
  return <ClientsListPage clients={clients} loading={loading} />
}
```

## Benefícios

✅ **Separation of Concerns** - Cada camada com responsabilidade
✅ **Testabilidade** - Lógica pode ser testada isoladamente
✅ **Reutilização** - Lógica compartilhada entre páginas
✅ **Maintainabilidade** - Fácil encontrar e atualizar
✅ **Performance** - Renders otimizados
✅ **Escalabilidade** - Padrão consistente para novos recursos

## Próximos Passos

1. Refatorar páginas existentes para remover lógica
2. Criar/atualizar hooks para cada feature
3. Consolidar services de negócio
4. Adicionar testes unitários dos hooks e services
5. Documentar padrão para novo desenvolvedor

## Referência Rápida

```typescript
// ✅ SEMPRE assim:
import { useHook } from '@/src/hooks'

export default function Page() {
  const { data, loading } = useHook()
  return <Component data={data} loading={loading} />
}

// ❌ NUNCA assim:
import { service } from '@/src/services'

export default function Page() {
  const [data, setData] = useState()
  useEffect(() => {
    service.fetch().then(setData)  // ❌ Lógica aqui
  }, [])
  return <>{data.map(...)}</>  // ❌ Transformação aqui
}
```
