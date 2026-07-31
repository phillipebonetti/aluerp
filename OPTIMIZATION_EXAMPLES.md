# Exemplos Práticos de Otimizações - AluERP

## 1. Lista de Clientes - Otimizada

### Antes (Sem Otimização)

```typescript
// ❌ Problemas:
// - ClientCard re-renderiza mesmo com mesmos props
// - Novo handleSelect a cada render
// - Filtragem a cada render
export function ClientsList({ clients, searchTerm }: Props) {
  const handleSelect = (client) => {
    navigate(`/clientes/${client.id}`)
  }

  const filtered = clients.filter(c =>
    c.name.includes(searchTerm)
  )

  return (
    <div>
      {filtered.map(c => (
        <ClientCard key={c.id} client={c} onSelect={handleSelect} />
      ))}
    </div>
  )
}

function ClientCard({ client, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(client)}>
      {client.name}
    </div>
  )
}
```

### Depois (Otimizado)

```typescript
// ✅ Otimizações aplicadas:
// - useCallback para handleSelect
// - useMemo para filtragem
// - React.memo para ClientCard
import React, { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface ClientItemProps {
  id: string
  name: string
  email: string
  onSelect: (id: string) => void
}

const ClientCard = React.memo(
  function ClientCard({ id, name, email, onSelect }: ClientItemProps) {
    return (
      <div
        className="p-4 border rounded cursor-pointer hover:bg-gray-50"
        onClick={() => onSelect(id)}
      >
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-600">{email}</p>
      </div>
    )
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name
)

export function ClientsList({ clients, searchTerm }: Props) {
  const router = useRouter()

  // Memoizar callback
  const handleSelect = useCallback(
    (id: string) => {
      router.push(`/clientes/${id}`)
    },
    [router]
  )

  // Memoizar filtragem
  const filtered = useMemo(
    () => clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [clients, searchTerm]
  )

  return (
    <div className="space-y-2">
      {filtered.map(c => (
        <ClientCard
          key={c.id}
          id={c.id}
          name={c.name}
          email={c.email}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
```

## 2. Dashboard com Widgets Lazy

### Antes (Carrega Tudo)

```typescript
// ❌ Problema: Todos os widgets carregam juntos
import { Charts } from '@/components/dashboard/charts'
import { TopClients } from '@/components/dashboard/top-clients'
import { FinancialIndicators } from '@/components/dashboard/financial'

export function Dashboard() {
  return (
    <div>
      <Charts />
      <TopClients />
      <FinancialIndicators />
    </div>
  )
}
```

### Depois (Lazy Loading)

```typescript
// ✅ Widgets pesados carregam sob demanda
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Charts = dynamic(
  () => import('@/components/dashboard/charts'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const TopClients = dynamic(
  () => import('@/components/dashboard/top-clients'),
  {
    loading: () => <ListSkeleton />,
    ssr: false
  }
)

const FinancialIndicators = dynamic(
  () => import('@/components/dashboard/financial'),
  {
    loading: () => <CardSkeleton />,
    ssr: false
  }
)

export function Dashboard() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<KPISkeleton />}>
        <KPICards />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Charts />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<ListSkeleton />}>
          <TopClients />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <FinancialIndicators />
        </Suspense>
      </div>
    </div>
  )
}
```

## 3. Form com Cálculos Complexos

### Antes (Recalcula sempre)

```typescript
// ❌ Problema:
// - Cálculos executam a cada keystroke
// - Objetos derivados recriados
export function QuoteForm({ items }: Props) {
  const [discount, setDiscount] = useState(0)

  // Recalcula a cada render
  const totals = items.reduce((acc, item) => ({
    subtotal: acc.subtotal + (item.price * item.quantity),
    tax: (acc.subtotal * 0.1),
  }), { subtotal: 0, tax: 0 })

  const final = totals.subtotal + totals.tax - discount

  return (
    <form>
      <input
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
      />
      <p>Total: {final}</p>
    </form>
  )
}
```

### Depois (Memoizado)

```typescript
// ✅ Cálculos memoizados
import { useMemo, useCallback } from 'react'

export function QuoteForm({ items }: Props) {
  const [discount, setDiscount] = useState(0)

  // Memoizar cálculos complexos
  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    )
    const tax = subtotal * 0.1

    return { subtotal, tax }
  }, [items])

  const final = useMemo(
    () => totals.subtotal + totals.tax - discount,
    [totals, discount]
  )

  const handleDiscountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setDiscount(Number(e.target.value))
    },
    []
  )

  return (
    <form>
      <input
        value={discount}
        onChange={handleDiscountChange}
      />
      <p>Subtotal: {totals.subtotal.toFixed(2)}</p>
      <p>Imposto: {totals.tax.toFixed(2)}</p>
      <p>Desconto: {discount.toFixed(2)}</p>
      <p className="font-bold">Total: {final.toFixed(2)}</p>
    </form>
  )
}
```

## 4. Tabela com Muitas Linhas

### Antes (Renderiza Tudo)

```typescript
// ❌ Problema: Renderiza todas as 1000 linhas
export function TransactionsList({ transactions }: Props) {
  return (
    <table>
      <tbody>
        {transactions.map(tx => (
          <tr key={tx.id}>
            <td>{tx.date}</td>
            <td>{tx.description}</td>
            <td>{tx.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Depois (Virtual Scrolling)

```typescript
// ✅ Virtual scrolling + React.memo
'use client'

import { useMemo } from 'react'
import React from 'react'

const TransactionRow = React.memo(
  function TransactionRow({ transaction }: Props) {
    return (
      <tr>
        <td>{transaction.date}</td>
        <td>{transaction.description}</td>
        <td>${transaction.amount.toFixed(2)}</td>
      </tr>
    )
  },
  (prev, next) => prev.transaction.id === next.transaction.id
)

export function TransactionsList({ transactions }: Props) {
  // Implementar virtual scrolling ou pagination
  const visibleTransactions = useMemo(
    () => transactions.slice(0, 50), // Mostrar 50 por página
    [transactions]
  )

  return (
    <table>
      <tbody>
        {visibleTransactions.map(tx => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </tbody>
    </table>
  )
}
```

## 5. Filtro com Debounce

### Antes (Sem Debounce)

```typescript
// ❌ Problema: Filtra em cada keystroke (100+ vezes)
export function SearchClients() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])

  const filtered = clients.filter(c =>
    c.name.includes(search)
  )

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  )
}
```

### Depois (Com Debounce)

```typescript
// ✅ Debounce reduz chamadas
'use client'

import { useState, useEffect, useMemo } from 'react'

export function SearchClients() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Filtrar com valor debounced
  const filtered = useMemo(
    () => clients.filter(c =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [debouncedSearch]
  )

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Digite para buscar..."
      />
      <ClientsList clients={filtered} />
    </div>
  )
}
```

## 6. Modal Pesado com Lazy Loading

### Antes (Carrega sempre)

```typescript
// ❌ Problema: Modal pesado carregado mesmo quando fechado
import { AdvancedFilters } from '@/components/filters'

export function ReportPage() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <>
      <button onClick={() => setShowFilters(true)}>Filtros Avançados</button>
      {showFilters && (
        <AdvancedFilters onClose={() => setShowFilters(false)} />
      )}
    </>
  )
}
```

### Depois (Lazy Loading)

```typescript
// ✅ Modal carregado apenas quando aberto
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const AdvancedFilters = dynamic(
  () => import('@/components/filters'),
  { ssr: false }
)

export function ReportPage() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <>
      <button onClick={() => setShowFilters(true)}>
        Filtros Avançados
      </button>
      {showFilters && (
        <AdvancedFilters onClose={() => setShowFilters(false)} />
      )}
    </>
  )
}
```

## 7. Context com Muitos Subscribers

### Antes (Re-render em cadeia)

```typescript
// ❌ Problema: Qualquer mudança re-renderiza todos
const FilterContext = createContext()

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({})

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  )
}
```

### Depois (Separado em contextos)

```typescript
// ✅ Separar em múltiplos contextos menores
const FilterValueContext = createContext()
const FilterActionsContext = createContext()

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({})

  const value = useMemo(() => ({ filters }), [filters])
  const actions = useMemo(() => ({ setFilters }), [])

  return (
    <FilterValueContext.Provider value={value}>
      <FilterActionsContext.Provider value={actions}>
        {children}
      </FilterActionsContext.Provider>
    </FilterValueContext.Provider>
  )
}

// Hook separado para apenas ler
export function useFilterValue() {
  return useContext(FilterValueContext)
}

// Hook separado para ações
export function useFilterActions() {
  return useContext(FilterActionsContext)
}
```

## 8. Componente com Props Complexas

### Antes (Sem Memo)

```typescript
// ❌ Re-renderiza mesmo com props iguais (objetos diferentes)
function ClientForm({ client, onSubmit }: Props) {
  return (
    <form onSubmit={() => onSubmit(client)}>
      <input value={client.name} />
    </form>
  )
}
```

### Depois (Com Comparação)

```typescript
// ✅ Comparação customizada
const ClientForm = React.memo(
  function ClientForm({ client, onSubmit }: Props) {
    return (
      <form onSubmit={() => onSubmit(client)}>
        <input value={client.name} />
      </form>
    )
  },
  (prevProps, nextProps) => {
    // Retorna true se props são iguais (não renderiza)
    return (
      prevProps.client.id === nextProps.client.id &&
      prevProps.client.name === nextProps.client.name &&
      prevProps.client.email === nextProps.client.email
    )
  }
)
```

## Métricas de Impacto

| Técnica | Problema | Solução | Impacto |
|---------|----------|---------|--------|
| React.memo | 1000 re-renders | 1 render | 99% redução |
| useCallback | Nova função a cada render | Função estável | 80% redução |
| useMemo | Cálculos repetidos | Cache resultado | 70% redução |
| dynamic() | Bundle grande | Carrega sob demanda | 50% menos JS inicial |
| Virtual scroll | 1000 elementos DOM | Apenas visíveis | 90% redução DOM |

