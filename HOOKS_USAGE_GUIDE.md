# Guia de Uso - Hooks Customizados do AluERP

## Visão Geral

Os hooks customizados do AluERP encapsulam toda a lógica de estado e operações de cada domínio de negócio. Cada hook fornece:

- **Gerenciamento de Estado** - Mantém dados em cache
- **Operações CRUD** - Criar, ler, atualizar, deletar
- **Ações de Negócio** - Operações específicas do domínio
- **Cache Automático** - Reduz requisições ao servidor
- **Error Handling** - Tratamento de erros centralizado

## Hooks Disponíveis

### 1. useClientes - Gestão de Clientes

```typescript
import { useClientes } from '@/src/hooks'

export function MeusClientes() {
  const {
    clientes,
    cliente,
    isLoading,
    error,
    listar,
    obter,
    criar,
    atualizar,
    deletar,
    revalidar
  } = useClientes()

  // Listar clientes com filtros
  useEffect(() => {
    listar({ status: 'ACTIVE', city: 'São Paulo' })
  }, [listar])

  // Obter cliente específico
  const handleOpen = (id: string) => {
    obter(id)
  }

  // Criar novo cliente
  const handleCreate = async () => {
    const result = await criar({
      name: 'Novo Cliente',
      email: 'email@example.com',
      status: 'ACTIVE'
    })
    if (result) {
      toast.success('Cliente criado com sucesso')
      revalidar()
    }
  }

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return (
    <div>
      {clientes.map(cliente => (
        <ClientCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  )
}
```

**Operações Disponíveis:**
- `listar(filters)` - Lista clientes com filtros
- `obter(id)` - Obtém um cliente específico
- `criar(data)` - Cria novo cliente
- `atualizar(id, data)` - Atualiza cliente
- `deletar(id)` - Deleta cliente
- `revalidar()` - Revalida cache

**Filtros:**
- `search` - Busca por nome/email
- `status` - ACTIVE, INACTIVE
- `category` - Categoria do cliente
- `city` - Cidade

---

### 2. useObras - Gestão de Obras/Projetos

```typescript
import { useObras } from '@/src/hooks'

export function MinhasObras() {
  const {
    obras,
    obra,
    isLoading,
    listar,
    atualizarStatus,
    revalidar
  } = useObras()

  useEffect(() => {
    listar({ status: 'ACTIVE' })
  }, [listar])

  const handleStatusChange = async (id: string, status: string) => {
    const success = await atualizarStatus(id, status)
    if (success) {
      toast.success('Status atualizado')
      revalidar()
    }
  }

  return (
    <div>
      {obras.map(obra => (
        <ObraCard 
          key={obra.id} 
          obra={obra}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}
```

**Operações Disponíveis:**
- `listar(filters)` - Lista obras
- `obter(id)` - Obtém obra específica
- `criar(data)` - Cria nova obra
- `atualizar(id, data)` - Atualiza obra
- `deletar(id)` - Deleta obra
- `atualizarStatus(id, status)` - Muda status
- `revalidar()` - Revalida cache

**Filtros:**
- `search` - Busca por nome
- `status` - PLANNING, ACTIVE, COMPLETED, CANCELLED
- `clientId` - Filtrar por cliente
- `responsibleId` - Filtrar por responsável
- `priority` - LOW, MEDIUM, HIGH, URGENT

---

### 3. useFinanceiro - Gestão Financeira

```typescript
import { useFinanceiro } from '@/src/hooks'

export function Dashboard() {
  const {
    transactions,
    metrics,
    isLoading,
    listarTransacoes,
    obterMetricas,
    criarTransacao,
    revalidar
  } = useFinanceiro()

  useEffect(() => {
    obterMetricas()
    listarTransacoes({ 
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })
  }, [listarTransacoes, obterMetricas])

  const handleCreateTransaction = async (data) => {
    const result = await criarTransacao(data)
    if (result) {
      toast.success('Transação criada')
      revalidar() // Revalida métricas automaticamente
    }
  }

  return (
    <div>
      <MetricCards metrics={metrics} />
      <TransactionList transactions={transactions} />
    </div>
  )
}
```

**Operações Disponíveis:**
- `listarTransacoes(filters)` - Lista transações
- `listarContas()` - Lista contas bancárias
- `obterMetricas()` - Obtém métricas financeiras
- `criarTransacao(data)` - Cria transação
- `atualizarTransacao(id, data)` - Atualiza transação
- `deletarTransacao(id)` - Deleta transação
- `revalidar()` - Revalida tudo

**Filtros:**
- `startDate`, `endDate` - Período
- `type` - INCOME, EXPENSE
- `status` - PENDING, CONFIRMED, PAID
- `category` - Categoria
- `accountId` - Conta específica

**Métricas Retornadas:**
- `totalIncome` - Receita total
- `totalExpense` - Despesa total
- `balance` - Saldo
- `accountsValue` - Valor em contas
- `upcomingPayments` - Pagamentos próximos

---

### 4. useFornecedores - Gestão de Fornecedores

```typescript
import { useFornecedores } from '@/src/hooks'

export function Fornecedores() {
  const {
    fornecedores,
    criar,
    avaliar,
    revalidar
  } = useFornecedores()

  useEffect(() => {
    listar({ status: 'ACTIVE' })
  }, [listar])

  const handleRate = async (id: string) => {
    const success = await avaliar(id, 5, 'Excelente fornecedor')
    if (success) {
      toast.success('Avaliação registrada')
      revalidar()
    }
  }

  return (
    <div>
      {fornecedores.map(f => (
        <SupplierCard 
          key={f.id} 
          supplier={f}
          onRate={() => handleRate(f.id)}
        />
      ))}
    </div>
  )
}
```

**Operações Disponíveis:**
- `listar(filters)` - Lista fornecedores
- `obter(id)` - Obtém fornecedor
- `criar(data)` - Cria fornecedor
- `atualizar(id, data)` - Atualiza fornecedor
- `deletar(id)` - Deleta fornecedor
- `avaliar(id, rating, comment)` - Avalia fornecedor
- `revalidar()` - Revalida cache

---

### 5. useOrcamentos - Gestão de Orçamentos

```typescript
import { useOrcamentos } from '@/src/hooks'

export function Orcamentos() {
  const {
    orcamentos,
    enviar,
    aceitar,
    rejeitar,
    converter,
    revalidar
  } = useOrcamentos()

  const handleSendQuote = async (id: string, email: string) => {
    const success = await enviar(id, email)
    if (success) {
      toast.success('Orçamento enviado')
      revalidar()
    }
  }

  const handleAccept = async (id: string) => {
    const success = await aceitar(id)
    if (success) {
      const success2 = await converter(id)
      if (success2) {
        toast.success('Convertido em Obra')
      }
      revalidar()
    }
  }

  return (
    <div>
      {orcamentos.map(o => (
        <QuoteCard
          key={o.id}
          quote={o}
          onSend={handleSendQuote}
          onAccept={handleAccept}
        />
      ))}
    </div>
  )
}
```

**Operações Disponíveis:**
- `listar(filters)` - Lista orçamentos
- `obter(id)` - Obtém orçamento
- `criar(data)` - Cria orçamento
- `atualizar(id, data)` - Atualiza orçamento
- `deletar(id)` - Deleta orçamento
- `enviar(id, email)` - Envia para cliente
- `aceitar(id)` - Marca como aceito
- `rejeitar(id)` - Marca como rejeitado
- `converter(id)` - Converte em Obra
- `revalidar()` - Revalida cache

**Fluxo de Trabalho:**
1. Criar orçamento (DRAFT)
2. Enviar para cliente (SENT)
3. Cliente aceita (ACCEPTED) ou rejeita (REJECTED)
4. Converter em Obra (gera ServiceOrder)

---

### 6. useOS - Gestão de Ordens de Serviço

```typescript
import { useOS } from '@/src/hooks'

export function OrdensDEServiço() {
  const {
    osOrders,
    iniciar,
    concluir,
    cancelar,
    atualizarStatus,
    revalidar
  } = useOS()

  const handleStart = async (id: string) => {
    const success = await iniciar(id)
    if (success) {
      toast.success('OS iniciada')
      revalidar()
    }
  }

  const handleComplete = async (id: string, notes: string) => {
    const success = await concluir(id, notes)
    if (success) {
      toast.success('OS concluída')
      revalidar()
    }
  }

  return (
    <div>
      {osOrders.map(os => (
        <OSCard
          key={os.id}
          order={os}
          onStart={() => handleStart(os.id)}
          onComplete={(notes) => handleComplete(os.id, notes)}
        />
      ))}
    </div>
  )
}
```

**Operações Disponíveis:**
- `listar(filters)` - Lista OS
- `obter(id)` - Obtém OS
- `criar(data)` - Cria OS
- `atualizar(id, data)` - Atualiza OS
- `deletar(id)` - Deleta OS
- `atualizarStatus(id, status)` - Muda status
- `iniciar(id)` - Inicia OS
- `concluir(id, notes)` - Conclui OS
- `cancelar(id, reason)` - Cancela OS
- `revalidar()` - Revalida cache

**Fluxo de Trabalho:**
1. OS gerada (DRAFT)
2. Agendar (SCHEDULED)
3. Iniciar (IN_PROGRESS)
4. Concluir (COMPLETED)
5. Ou cancelar (CANCELLED)

---

## Padrões de Uso

### Padrão 1: Listar e Filtrar

```typescript
const { listar, isLoading, clientes } = useClientes()

useEffect(() => {
  listar({ 
    search: 'João',
    status: 'ACTIVE' 
  })
}, [listar])

return <ClientList clients={clientes} loading={isLoading} />
```

### Padrão 2: CRUD Completo

```typescript
const {
  criar,
  atualizar,
  deletar,
  obter,
  error
} = useClientes()

const handleCreate = async (data) => {
  const result = await criar(data)
  if (result) showSuccess('Criado com sucesso')
  else showError(error?.message)
}

const handleUpdate = async (id, data) => {
  const result = await atualizar(id, data)
  if (result) showSuccess('Atualizado')
}

const handleDelete = async (id) => {
  const result = await deletar(id)
  if (result) showSuccess('Deletado')
}
```

### Padrão 3: Revalidar Dados

```typescript
const { criar, revalidar } = useClientes()

const handleCreate = async (data) => {
  const result = await criar(data)
  if (result) {
    // Opção 1: Revalidar automaticamente
    await revalidar()
    
    // Opção 2: Se o hook já revalida internamente
    // (verificar documentação do hook específico)
  }
}
```

### Padrão 4: Ações Relacionadas

```typescript
const { osOrder, iniciar, concluir } = useOS()

const handleComplete = async () => {
  const notes = 'Serviço concluído com sucesso'
  const success = await concluir(osOrder.id, notes)
  if (success) {
    // Atualização automática, osOrder é atualizado
    console.log(osOrder.status) // COMPLETED
  }
}
```

---

## Cache e Revalidação

### Como o Cache Funciona

```typescript
// Primeira chamada - busca no servidor
const { data, isLoading } = useCache('key', fetcher)
// isLoading = true, depois false quando dados chegam

// Segunda chamada nos próximos 5 minutos - retorna cache
// isLoading = false imediatamente

// Após 5 minutos - busca novamente automaticamente
```

### Revalidar Manualmente

```typescript
const { revalidar } = useClientes()

// Força busca dos dados mesmo se cache válido
await revalidar()

// Útil após criar/atualizar/deletar
const result = await criar(data)
if (result) {
  await revalidar() // Atualiza lista
}
```

### TTL (Time to Live)

Cada hook tem um TTL configurado:
- **Clientes**: 5 minutos
- **Obras**: 3 minutos
- **Financeiro (Transações)**: 2 minutos
- **Financeiro (Métricas)**: 1 minuto
- **Fornecedores**: 5 minutos
- **Orçamentos**: 3 minutos
- **OS**: 2 minutos

---

## Error Handling

```typescript
import { useClientes } from '@/src/hooks'

export function ClientList() {
  const { clientes, isLoading, error } = useClientes()

  if (isLoading) {
    return <Spinner />
  }

  if (error) {
    return (
      <Alert type="error">
        {error.message}
        <button onClick={() => revalidar()}>
          Tentar novamente
        </button>
      </Alert>
    )
  }

  return (
    <ul>
      {clientes.map(c => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  )
}
```

---

## TypeScript

Todos os hooks são totalmente tipados:

```typescript
import { useClientes } from '@/src/hooks'
import type { Client } from '@prisma/client'

export function MyComponent() {
  const { clientes, criar }: UseClientesReturn = useClientes()
  
  const handleCreate = async (data: Partial<Client>) => {
    const result: Client | null = await criar(data)
  }
}
```

---

## Performance

### Dicas de Performance

1. **Use filtros para limitar dados**
   ```typescript
   // BOM - retorna apenas 10 clientes
   listar({ status: 'ACTIVE', city: 'SP' })
   
   // RUIM - pode retornar muitos clientes
   listar({})
   ```

2. **Reutilize dados em cache**
   ```typescript
   // BOM - compartilha cache entre componentes
   const { clientes } = useClientes()
   
   // RUIM - múltiplas chamadas
   listar() em cada componente
   ```

3. **Limpe filtros antigos**
   ```typescript
   // Antes de desmontar componente
   useEffect(() => {
    return () => {
      // Limpar se necessário
    }
   }, [])
   ```

---

## Debugging

Ativar logs do cache:

```typescript
import { useCache, getCacheSize } from '@/src/hooks'

// Verificar tamanho do cache
console.log('Cache size:', getCacheSize())

// Limpar cache específico
import { clearCache } from '@/src/hooks'
clearCache('clientes')
```

---

## Migração de Código Antigo

### Antes (Query direta)
```typescript
const [clientes, setClientes] = useState([])

useEffect(() => {
  const fetchClientes = async () => {
    const { data } = await supabase.from('clients').select()
    setClientes(data || [])
  }
  fetchClientes()
}, [])
```

### Depois (Com hook)
```typescript
const { clientes, listar } = useClientes()

useEffect(() => {
  listar()
}, [listar])
```

---

## Conclusão

Os hooks customizados do AluERP:
- ✅ Centralizam lógica de estado
- ✅ Fornecem operações CRUD prontas
- ✅ Implementam cache automático
- ✅ Tratam erros centralizadamente
- ✅ Revalidam dados conforme necessário
- ✅ Totalmente tipados com TypeScript

Use-os em todos os seus componentes para um código mais limpo, seguro e performático!
