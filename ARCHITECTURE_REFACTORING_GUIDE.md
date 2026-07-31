# Guia de Refatoração da Arquitetura AluERP

## Objetivo

Refatorar completamente a arquitetura do AluERP para:
- Centralizar toda lógica de acesso a dados em Services
- Eliminar queries diretas ao Supabase de componentes React
- Preparar o sistema para crescer com segurança
- Manter 100% compatibilidade com funcionalidades existentes

## Arquitetura Atual

```
Pages (RSC)
    ↓
Server Actions
    ↓
Services
    ↓
Repositories
    ↓
Prisma (Database)
```

## Padrão de Implementação

### 1. Services (Lógica de Negócio)

Cada serviço encapsula a lógica de negócio de um domínio específico.

```typescript
// src/services/[domain].service.ts

import { RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class [DomainService] {
  async getAll(options: RepositoryOptions): Promise<T[]> {
    // Implementar
  }

  async getById(id: string, options: RepositoryOptions): Promise<T | null> {
    // Implementar
  }

  async create(data: any, options: RepositoryOptions): Promise<T> {
    // Implementar
  }

  async update(id: string, data: any, options: RepositoryOptions): Promise<T | null> {
    // Implementar
  }

  async delete(id: string, options: RepositoryOptions): Promise<boolean> {
    // Implementar
  }
}
```

### 2. Server Actions (Interface com Autenticação)

Cada módulo deve ter um arquivo `actions/index.ts` com server actions.

```typescript
// src/modules/[module]/actions/index.ts

'use server'

import { getCurrentUser } from '@/src/core/auth'
import { [DomainService] } from '@/services'

export async function getAll() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const service = new [DomainService]()
    const data = await service.getAll({
      companyId: user.companyId,
    })

    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function create(input: any) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const service = new [DomainService]()
    const item = await service.create(input, {
      companyId: user.companyId,
    })

    return { data: item }
  } catch (error: any) {
    return { error: error.message }
  }
}
```

### 3. Componentes React (Sem Queries)

Componentes devem usar Server Actions via hooks ou props.

```typescript
// ❌ ERRADO - Query direta no componente
export default function Component() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    const { data: supabaseData } = supabase
      .from('items')
      .select('*')
    setData(supabaseData)
  }, [])
}

// ✅ CORRETO - Usando Server Action
'use client'

import { getItems } from '@/src/modules/[module]/actions'

export default function Component() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    async function load() {
      const result = await getItems()
      if (result.data) setData(result.data)
    }
    load()
  }, [])
}
```

## Services Criados

### 1. AuthService
- `getUserWithPermissions(userId: string)`
- `hasPermission(userId: string, permissionCode: string)`
- `getCompanyUsers(companyId: string)`
- `updateProfile(userId: string, data: any)`

### 2. ClientService
- `getAll(options: RepositoryOptions)`
- `getById(id: string, options: RepositoryOptions)`
- `create(data: any, options: RepositoryOptions)`
- `update(id: string, data: any, options: RepositoryOptions)`
- `delete(id: string, options: RepositoryOptions)`
- `getClientsWithAnalysis(options: RepositoryOptions)`
- `calculateClientBalance(clientId: string, options: RepositoryOptions)`

### 3. ProjectService (Obras)
- `getAll(options: RepositoryOptions)`
- `getById(id: string, options: RepositoryOptions)`
- `create(data: any, options: RepositoryOptions)`
- `update(id: string, data: any, options: RepositoryOptions)`
- `delete(id: string, options: RepositoryOptions)`
- `getActiveProjectsWithAnalysis(options: RepositoryOptions)`
- `getProjectFinancialStatus(projectId: string, options: RepositoryOptions)`

### 4. FinancialService
- `calculateMetrics(options: RepositoryOptions)`
- `getDashboardKPIs(options: RepositoryOptions)`
- `calculateBalance(options: RepositoryOptions)`
- `getTransactionHistory(clientId: string, options: RepositoryOptions)`

### 5. SupplierService
- `getAll(options: RepositoryOptions)`
- `getById(id: string, options: RepositoryOptions)`
- `create(data: any, options: RepositoryOptions)`
- `update(id: string, data: any, options: RepositoryOptions)`
- `delete(id: string, options: RepositoryOptions)`

### 6. BudgetService (Orçamentos)
- `getAll(options: RepositoryOptions)` - Recupera todos os orçamentos
- `getById(id: string, options: RepositoryOptions)` - Recupera um orçamento
- `create(data: any, options: RepositoryOptions)` - Cria novo orçamento
- `update(id: string, data: any, options: RepositoryOptions)` - Atualiza orçamento
- `delete(id: string, options: RepositoryOptions)` - Deleta orçamento
- `approve(id: string, options: RepositoryOptions)` - Aprova orçamento
- `reject(id: string, options: RepositoryOptions)` - Rejeita orçamento
- `send(id: string, options: RepositoryOptions)` - Envia orçamento
- `getByClient(clientId: string, options: RepositoryOptions)` - Recupera orçamentos por cliente
- `countByStatus(options: RepositoryOptions)` - Conta orçamentos por status

### 7. OSService (Ordens de Serviço)
- `getAll(options: RepositoryOptions)` - Recupera todas as OS
- `getById(id: string, options: RepositoryOptions)` - Recupera uma OS
- `create(data: any, options: RepositoryOptions)` - Cria nova OS
- `update(id: string, data: any, options: RepositoryOptions)` - Atualiza OS
- `delete(id: string, options: RepositoryOptions)` - Deleta OS
- `start(id: string, options: RepositoryOptions)` - Inicia OS
- `complete(id: string, options: RepositoryOptions)` - Conclui OS
- `cancel(id: string, options: RepositoryOptions)` - Cancela OS
- `getByProject(projectId: string, options: RepositoryOptions)` - Recupera OS por projeto
- `getOpen(options: RepositoryOptions)` - Lista OS abertas
- `countByStatus(options: RepositoryOptions)` - Conta OS por status
- `getNextNumber(options: RepositoryOptions)` - Gera próximo número de OS

## Checklist de Refatoração

### Status por Módulo

- [x] Auth - Server actions já existem
- [x] Clients - Services e actions criados
- [x] Projects - Services e actions criados
- [x] Financial - Services existem, ações refatoradas
- [x] Dashboard - Services e actions existem
- [x] Suppliers - Services existem
- [ ] Budgets - Service criado, ações precisam ser criadas
- [ ] OS - Service criado, ações precisam ser criadas
- [ ] Estoque - Precisa ser refatorado
- [ ] Produção - Precisa ser refatorado
- [ ] RH - Precisa ser refatorado
- [ ] CRM - Precisa de refatoração

### Próximos Passos

1. **Criar Server Actions para Budget**
   - createBudget()
   - updateBudget()
   - deleteBudget()
   - approveBudget()
   - getBudgetList()

2. **Criar Server Actions para OS**
   - createOS()
   - updateOS()
   - deleteOS()
   - startOS()
   - completeOS()
   - getOSList()

3. **Refatorar Páginas**
   - Budget page deve usar Server Actions
   - OS page deve usar Server Actions
   - Todos os componentes devem usar Server Actions

4. **Validação**
   - Garantir que nenhum componente faz query direta ao Supabase
   - Verificar que todas as rotas estão protegidas
   - Testar funcionalidades end-to-end

## Benefícios da Refatoração

1. **Segurança**
   - Todas as queries passam por autenticação
   - Dados filtrados por company

2. **Manutenibilidade**
   - Lógica centralizada e reutilizável
   - Fácil de testar
   - Fácil de modificar

3. **Performance**
   - Queries otimizadas em um único lugar
   - Caching possível
   - Reutilização de dados

4. **Escalabilidade**
   - Fácil adicionar novos recursos
   - Mudanças mínimas em componentes
   - Suporta novas integrações

## Dúvidas Frequentes

**P: Posso fazer queries direto no Service?**
R: Sim, o Service pode fazer queries diretas ao Prisma. O importante é que nenhum componente React faz queries.

**P: Como trato erros?**
R: No Server Action, sempre retorne `{ error: string }` ou `{ data: any }`. O componente verifica `result.error`.

**P: Preciso criar um novo Service ou Action?**
R: Crie um Service novo para cada domínio. Actions são apenas wrappers do Service que adicionam autenticação.

**P: Como compartilho dados entre Components?**
R: Use Context API, Zustand ou SWR com Server Actions. Nunca use props para dados que vêm de um Service.

## Referência Rápida

```typescript
// Padrão completo de um Service
export class MyService {
  async getAll(options: RepositoryOptions): Promise<T[]> {
    return await prisma.myTable.findMany({
      where: { companyId: options.companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(id: string, options: RepositoryOptions): Promise<T | null> {
    return await prisma.myTable.findFirst({
      where: { id, companyId: options.companyId, deletedAt: null },
    })
  }

  async create(data: CreateInput, options: RepositoryOptions): Promise<T> {
    return await prisma.myTable.create({
      data: { ...data, companyId: options.companyId },
    })
  }

  async update(id: string, data: UpdateInput, options: RepositoryOptions): Promise<T | null> {
    return await prisma.myTable.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })
  }

  async delete(id: string, options: RepositoryOptions): Promise<boolean> {
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

---

**Última atualização:** 30/07/2026
**Status:** Arquitetura refatorada com sucesso
**Próxima fase:** Implementação de Actions para todos os serviços
