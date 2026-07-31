# Performance Optimization - AluERP

## Estratégia de Otimização

Aplicar otimizações de performance em React para melhorar velocidade, UX e reduzir carga.

## 1. React.memo - Evitar Re-renders Desnecessários

### Quando Usar
- Componentes que recebem props complexas/grandes
- Componentes renderizados frequentemente
- Componentes puros (sem side effects)
- Componentes em listas com muitos itens

### Quando NÃO Usar
- Componentes com muitas props que mudam
- Componentes com callbacks frequentes
- Contextos que mudam constantemente

### Exemplo: Component Puro

```typescript
// ❌ Sem otimização - Re-renderiza sempre
function ClientCard({ client, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(client)}>
      {client.name}
    </div>
  )
}

// ✅ Com React.memo
const ClientCard = React.memo(function ClientCard({ client, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(client)}>
      {client.name}
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada (opcional)
  return prevProps.client.id === nextProps.client.id
})
```

### Exemplo: Lista com Muitos Items

```typescript
// ✅ Otimizado para listas
interface ClientItemProps {
  id: string
  name: string
  email: string
  onSelect: (id: string) => void
}

const ClientItem = React.memo(
  function ClientItem({ id, name, email, onSelect }: ClientItemProps) {
    return (
      <div onClick={() => onSelect(id)}>
        <p>{name}</p>
        <p>{email}</p>
      </div>
    )
  },
  (prev, next) => prev.id === next.id && prev.name === next.name
)

export function ClientsList({ clients }: Props) {
  return (
    <div>
      {clients.map(client => (
        <ClientItem
          key={client.id}
          {...client}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
```

## 2. useCallback - Estabilizar Functions

### Quando Usar
- Callbacks passadas a componentes React.memo
- Event handlers em listas
- Dependências de useEffect
- Funções passadas a múltiplos componentes

### Quando NÃO Usar
- Functions que não são repassadas
- Functions simples sem dependências complexas
- Dentro de listas (use useCallback em nivel pai)

### Exemplo: Event Handler

```typescript
// ❌ Sem otimização - Nova função a cada render
export function ClientList() {
  const handleSelect = (client) => {
    navigate(`/clientes/${client.id}`)
  }

  return (
    <div>
      {clients.map(c => (
        <ClientCard key={c.id} client={c} onSelect={handleSelect} />
      ))}
    </div>
  )
}

// ✅ Com useCallback
export function ClientList() {
  const handleSelect = useCallback((client) => {
    navigate(`/clientes/${client.id}`)
  }, [navigate])

  return (
    <div>
      {clients.map(c => (
        <ClientCard key={c.id} client={c} onSelect={handleSelect} />
      ))}
    </div>
  )
}
```

### Exemplo: Form com Validação

```typescript
// ✅ useCallback com dependências
export function ClientForm({ onSubmit }: Props) {
  const [form, setForm] = useState()

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }, [form, onSubmit])

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  )
}
```

## 3. useMemo - Cache Expensive Computations

### Quando Usar
- Cálculos complexos/heavy
- Filtragem/ordenação de arrays grandes
- Objetos/arrays derivados de props
- Transformação de dados

### Quando NÃO Usar
- Cálculos triviais (string concat, etc)
- Rendering simples
- State que muda frequentemente

### Exemplo: Filtragem de Lista

```typescript
// ❌ Sem otimização - Filtra a cada render
export function ClientsList({ clients, searchTerm }: Props) {
  const filtered = clients.filter(c =>
    c.name.includes(searchTerm)
  )

  return (
    <div>
      {filtered.map(c => <ClientCard key={c.id} {...c} />)}
    </div>
  )
}

// ✅ Com useMemo
export function ClientsList({ clients, searchTerm }: Props) {
  const filtered = useMemo(() =>
    clients.filter(c => c.name.includes(searchTerm)),
    [clients, searchTerm]
  )

  return (
    <div>
      {filtered.map(c => <ClientCard key={c.id} {...c} />)}
    </div>
  )
}
```

### Exemplo: Cálculos Financeiros

```typescript
// ✅ useMemo para cálculos
export function FinancialSummary({ transactions }: Props) {
  const summary = useMemo(() => {
    // Cálculos complexos
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const netIncome = income - expenses

    return { income, expenses, netIncome }
  }, [transactions])

  return (
    <div>
      <p>Receita: {summary.income}</p>
      <p>Despesa: {summary.expenses}</p>
      <p>Líquido: {summary.netIncome}</p>
    </div>
  )
}
```

### Exemplo: Derivar Objeto

```typescript
// ✅ useMemo para objetos derivados
interface FormattedClient {
  id: string
  display: string
  label: string
}

export function ClientSelector({ clients }: Props) {
  const options = useMemo<FormattedClient[]>(() =>
    clients.map(c => ({
      id: c.id,
      display: `${c.name} (${c.document})`,
      label: c.name
    })),
    [clients]
  )

  return <Select options={options} />
}
```

## 4. Lazy Loading - Código ao Demanda

### dynamic() para Componentes Pesados

```typescript
// ✅ Importar componente pesado apenas quando necessário
import dynamic from 'next/dynamic'

const AdvancedReports = dynamic(
  () => import('@/components/relatorios/advanced-reports'),
  {
    loading: () => <Skeleton />,
    ssr: false // Se não precisa render no servidor
  }
)

export function ReportsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div>
      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        Avançado
      </button>
      {showAdvanced && <AdvancedReports />}
    </div>
  )
}
```

### dynamic() para Rotas

```typescript
// ✅ Lazy load página completa
const ClientDetailPage = dynamic(
  () => import('@/components/clientes/detail-page'),
  { loading: () => <PageSkeleton /> }
)

export default ClientDetailPage
```

## 5. Code Splitting - Divisão de Código

### Padrão: Por Rota

```typescript
// app/layout.tsx
import dynamic from 'next/dynamic'

// Componentes por rota - cada um em seu próprio bundle
const DashboardLayout = dynamic(
  () => import('@/components/layout/dashboard-layout')
)

const AdminLayout = dynamic(
  () => import('@/components/layout/admin-layout')
)

export default function RootLayout() {
  // ...
}
```

### Padrão: Por Feature

```typescript
// components/index.ts
export { default as ClientsFeature } from './features/clients'
export { default as ProjectsFeature } from './features/projects'

// Cada feature é seu próprio bundle
// Carregado apenas quando acessado
```

### Padrão: Modal/Dialog Lazy

```typescript
// ✅ Modais pesados carregados sob demanda
import dynamic from 'next/dynamic'

const DeleteConfirmModal = dynamic(
  () => import('@/components/dialogs/delete-confirm'),
  { ssr: false }
)

const BulkImportModal = dynamic(
  () => import('@/components/dialogs/bulk-import'),
  { ssr: false }
)

export function DataActions() {
  const [showDelete, setShowDelete] = useState(false)
  const [showImport, setShowImport] = useState(false)

  return (
    <>
      <button onClick={() => setShowDelete(true)}>Deletar</button>
      <button onClick={() => setShowImport(true)}>Importar</button>

      {showDelete && <DeleteConfirmModal onClose={() => setShowDelete(false)} />}
      {showImport && <BulkImportModal onClose={() => setShowImport(false)} />}
    </>
  )
}
```

## 6. Image Optimization

```typescript
// ✅ Next.js Image com otimização
import Image from 'next/image'

export function ClientAvatar({ src, name }: Props) {
  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      placeholder="blur"
      blurDataURL="data:image/svg+xml,%3Csvg..."
    />
  )
}
```

## 7. Bundle Analysis

```bash
# Instalar bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Criar arquivo de config
# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})

# Rodar análise
ANALYZE=true npm run build
```

## Checklist de Otimização

### Por Tipo de Componente

#### Componentes em Listas
- [ ] Usar React.memo
- [ ] Memoizar callbacks com useCallback
- [ ] Usar key={id} em map
- [ ] Evitar criar objetos inline
- [ ] Extrair sub-componentes

#### Páginas Grandes
- [ ] Lazy load seções pesadas
- [ ] useMemo para cálculos
- [ ] Dynamic imports para features opcionais
- [ ] Code split por rota

#### Forms
- [ ] useCallback para handleChange
- [ ] useMemo para validações
- [ ] Memoizar campos individuais
- [ ] Lazy load campos opcionais

#### Dashboards
- [ ] Lazy load widgets pesados
- [ ] useMemo para agregações
- [ ] React.memo para cards
- [ ] Virtual scrolling para listas

## Arquivo: hooks/useOptimized.ts

```typescript
// Hook reutilizável para otimizações comuns
import { useMemo, useCallback } from 'react'

/**
 * Debounce search term para evitar muitos re-renders
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Memoize array de objetos com comparação customizada
 */
export function useMemoArray<T>(
  items: T[],
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): T[] {
  return useMemo(() => items, [items, compareFn])
}

/**
 * Callback com dependências automáticas
 */
export function useAutoCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[] = []
) {
  return useCallback(callback, deps)
}
```

## Performance Checklist por Domínio

### Dashboard
- [ ] Lazy load gráficos pesados
- [ ] useMemo para KPIs
- [ ] React.memo para cards
- [ ] Dynamic import de widgets

### Clientes
- [ ] React.memo para ClientCard
- [ ] useCallback para onSelect
- [ ] useMemo para filtering
- [ ] Lazy load ClientDetail

### Financeiro
- [ ] useMemo para cálculos (sum, avg)
- [ ] React.memo para transações
- [ ] Lazy load relatórios pesados
- [ ] Dynamic import de gráficos

### Relatórios
- [ ] Dynamic import de filtros avançados
- [ ] useMemo para agregações
- [ ] Lazy load exportadores
- [ ] Code split por tipo relatório

## Métricas de Performance

### Vitals para Monitorar
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- INP (Interaction Next Paint)

### Ferramenta: Lighthouse
```bash
# Instalar
npm install -g lighthouse

# Rodar análise
lighthouse https://seu-app.com --view
```

### Ferramenta: React DevTools Profiler
1. Abrir DevTools → Profiler tab
2. Gravar interação
3. Identificar renders desnecessários
4. Aplicar React.memo/useMemo

## Próximos Passos

1. Executar análise de bundle
2. Identificar componentes pesados
3. Aplicar React.memo a componentes em listas
4. Memoizar callbacks em form handlers
5. Lazy load seções de baixa prioridade
6. Monitorar Vitals com Lighthouse

## Template: Componente Otimizado

```typescript
import React, { useCallback, useMemo } from 'react'

interface ComponentProps {
  items: Item[]
  onSelect: (item: Item) => void
  searchTerm: string
}

const Component = React.memo(
  function Component({ items, onSelect, searchTerm }: ComponentProps) {
    // Memoizar filtro
    const filtered = useMemo(
      () => items.filter(i => i.name.includes(searchTerm)),
      [items, searchTerm]
    )

    // Memoizar callback
    const handleSelect = useCallback((item: Item) => {
      onSelect(item)
    }, [onSelect])

    return (
      <div>
        {filtered.map(item => (
          <Item
            key={item.id}
            item={item}
            onSelect={handleSelect}
          />
        ))}
      </div>
    )
  },
  (prev, next) =>
    prev.searchTerm === next.searchTerm &&
    prev.items.length === next.items.length
)

export default Component
```

## Referência Rápida

| Técnica | Quando | Impacto |
|---------|--------|---------|
| React.memo | Componentes em listas | Alto |
| useCallback | Callbacks passados a memo | Médio |
| useMemo | Cálculos heavy | Alto |
| dynamic() | Componentes pesados | Alto |
| Code split | Rotas/features grandes | Alto |
| Image opt | Muitas imagens | Médio |

