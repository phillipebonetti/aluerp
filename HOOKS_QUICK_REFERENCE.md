# Referência Rápida - Hooks do AluERP

## Importações

```typescript
import {
  useClientes,      // Clientes
  useObras,         // Obras/Projetos
  useFinanceiro,    // Financeiro
  useFornecedores,  // Fornecedores
  useOrcamentos,    // Orçamentos
  useOS,            // Ordens de Serviço
  useCache,         // Cache genérico
  useStandardForm,  // Formulários
} from '@/src/hooks'
```

## Exemplo Básico - useClientes

```typescript
const {
  clientes,           // Dados: Client[]
  cliente,            // Item: Client | null
  isLoading,          // bool
  error,              // Error | null
  listar,             // (filters?) => Promise<void>
  obter,              // (id: string) => Promise<void>
  criar,              // (data: Partial<Client>) => Promise<Client | null>
  atualizar,          // (id: string, data: Partial<Client>) => Promise<Client | null>
  deletar,            // (id: string) => Promise<boolean>
  revalidar,          // () => Promise<void>
} = useClientes()
```

## Todos os Hooks - Operações Padrão

| Hook | listar | obter | criar | atualizar | deletar | Ações Especiais |
|------|--------|-------|-------|-----------|---------|-----------------|
| useClientes | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| useObras | ✅ | ✅ | ✅ | ✅ | ✅ | `atualizarStatus` |
| useFinanceiro | ✅ | - | ✅ | ✅ | ✅ | `obterMetricas`, `listarContas` |
| useFornecedores | ✅ | ✅ | ✅ | ✅ | ✅ | `avaliar` |
| useOrcamentos | ✅ | ✅ | ✅ | ✅ | ✅ | `enviar`, `aceitar`, `rejeitar`, `converter` |
| useOS | ✅ | ✅ | ✅ | ✅ | ✅ | `atualizarStatus`, `iniciar`, `concluir`, `cancelar` |

## Padrões de Uso

### Listar com Filtros
```typescript
const { listar, clientes, isLoading } = useClientes()

useEffect(() => {
  listar({ status: 'ACTIVE', city: 'São Paulo' })
}, [listar])
```

### CRUD
```typescript
const { criar, atualizar, deletar } = useClientes()

// Criar
const newCliente = await criar({ name: 'João' })

// Atualizar
const updated = await atualizar(id, { name: 'João Silva' })

// Deletar
const success = await deletar(id)
```

### Error Handling
```typescript
const { error } = useClientes()

if (error) {
  console.error(error.message)
}
```

### Revalidar Cache
```typescript
const { criar, revalidar } = useClientes()

const result = await criar(data)
if (result) {
  await revalidar() // Atualiza lista
}
```

## Ações Especiais por Hook

### useObras
```typescript
const { atualizarStatus } = useObras()
await atualizarStatus(id, 'COMPLETED')
```

### useFinanceiro
```typescript
const { obterMetricas, listarContas } = useFinanceiro()
const metrics = await obterMetricas()
const accounts = await listarContas()
```

### useFornecedores
```typescript
const { avaliar } = useFornecedores()
await avaliar(id, 5, 'Excelente')
```

### useOrcamentos
```typescript
const { enviar, aceitar, rejeitar, converter } = useOrcamentos()
await enviar(id, 'email@example.com')
await aceitar(id)
await rejeitar(id)
await converter(id) // Converte em Obra
```

### useOS
```typescript
const { iniciar, concluir, cancelar } = useOS()
await iniciar(id)
await concluir(id, 'Notas da conclusão')
await cancelar(id, 'Motivo do cancelamento')
```

## Estados

```typescript
const { 
  isLoading, // boolean - carregando?
  error      // Error | null - erro?
} = useClientes()

if (isLoading) return <Spinner />
if (error) return <Error message={error.message} />
```

## Cache

```typescript
import { clearCache, getCacheSize } from '@/src/hooks'

// Verificar tamanho
const size = getCacheSize() // number

// Limpar específico
clearCache('clientes')

// Limpar tudo
clearCache()
```

## TypeScript

```typescript
import { useClientes } from '@/src/hooks'
import type { Client } from '@prisma/client'

const { clientes }: UseClientesReturn = useClientes()
```

## TTL (Cache Expiration)

- **Clientes**: 5 min
- **Obras**: 3 min
- **Financeiro (Trans)**: 2 min
- **Financeiro (Métricas)**: 1 min
- **Fornecedores**: 5 min
- **Orçamentos**: 3 min
- **OS**: 2 min

## Fluxos Comuns

### Novo Cliente
```typescript
const { criar, revalidar } = useClientes()
const novo = await criar({ name: 'Acme Corp' })
if (novo) await revalidar()
```

### Nova Obra
```typescript
const { criar } = useObras()
const obra = await criar({ 
  name: 'Projeto XYZ',
  clientId: 'client-123'
})
```

### Nova Transação
```typescript
const { criarTransacao } = useFinanceiro()
await criarTransacao({ 
  amount: 1000,
  type: 'INCOME'
})
```

### Novo Orçamento → Aceitar → Converter em Obra
```typescript
const { criar, aceitar, converter } = useOrcamentos()
const quote = await criar({ clientId: id })
const accepted = await aceitar(quote.id)
const converted = await converter(quote.id)
```

### Nova OS → Iniciar → Concluir
```typescript
const { criar, iniciar, concluir } = useOS()
const os = await criar({ clientId: id })
await iniciar(os.id)
await concluir(os.id, 'Serviço concluído')
```

## Troubleshooting

### Cache não atualiza?
```typescript
// Use revalidar() após mutações
const { criar, revalidar } = useClientes()
await criar(data)
await revalidar()
```

### Dados antigos?
```typescript
// Cache pode estar expirado
// Espere pelo TTL ou force revalidar
const { revalidar } = useClientes()
await revalidar()
```

### Performance lenta?
```typescript
// Use filtros para limitar dados
listar({ status: 'ACTIVE' }) // Bom
listar({})                    // Ruim
```

---

**Documentação Completa:** Veja `HOOKS_USAGE_GUIDE.md`
