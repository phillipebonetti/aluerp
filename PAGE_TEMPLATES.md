# Templates de Páginas - Copiar e Colar

Use estes templates como base para novas páginas.

## Template 1: Página de Lista

```typescript
// app/(app)/[feature]/page.tsx
'use client'

import { [FeatureName]ListPage } from '@/components/[feature]'
import { use[FeatureName]List } from '@/src/hooks'
import { useState } from 'react'

export default function [FeatureName]Page() {
  const [filters, setFilters] = useState()
  const { items, loading, error } = use[FeatureName]List(filters)

  return (
    <[FeatureName]ListPage
      items={items}
      loading={loading}
      error={error}
      filters={filters}
      onFilterChange={setFilters}
    />
  )
}
```

## Template 2: Página de Detalhe

```typescript
// app/(app)/[feature]/[id]/page.tsx
'use client'

import { [FeatureName]DetailPage } from '@/components/[feature]'
import { use[FeatureName] } from '@/src/hooks'

interface PageProps {
  params: { id: string }
}

export default function [FeatureName]DetailPage({ params }: PageProps) {
  const { item, loading, error, update } = use[FeatureName](params.id)

  return (
    <[FeatureName]DetailPage
      item={item}
      loading={loading}
      error={error}
      onUpdate={update}
    />
  )
}
```

## Template 3: Página de Criação

```typescript
// app/(app)/[feature]/novo/page.tsx
'use client'

import { [FeatureName]FormPage } from '@/components/[feature]'
import { useCreate[FeatureName] } from '@/src/hooks'
import { useRouter } from 'next/navigation'

export default function Novo[FeatureName]Page() {
  const router = useRouter()
  const { create, loading, error } = useCreate[FeatureName]()

  const handleSubmit = async (data) => {
    const result = await create(data)
    if (result) router.push('/[feature]')
  }

  return (
    <[FeatureName]FormPage
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  )
}
```

## Template 4: Página Server-Side

```typescript
// app/(app)/dashboard/page.tsx
import { DashboardPage } from '@/components/dashboard'
import { getServerData } from '@/src/services/[service]'

export const metadata = {
  title: '[Título da Página]',
  description: '[Descrição da página]'
}

export default async function DashboardPage() {
  const { data, error } = await getServerData()

  return <DashboardPage data={data} error={error} />
}
```

## Template 5: Página com Abas

```typescript
// app/(app)/[feature]/page.tsx
'use client'

import { [FeatureName]TabbedPage } from '@/components/[feature]'
import { use[FeatureName]Tab1 } from '@/src/hooks'
import { use[FeatureName]Tab2 } from '@/src/hooks'
import { useState } from 'react'

export default function [FeatureName]Page() {
  const [activeTab, setActiveTab] = useState('tab1')
  const tab1Data = use[FeatureName]Tab1()
  const tab2Data = use[FeatureName]Tab2()

  return (
    <[FeatureName]TabbedPage
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tab1Data={tab1Data}
      tab2Data={tab2Data}
    />
  )
}
```

## Template 6: Página com Filtros Avançados

```typescript
// app/(app)/[feature]/page.tsx
'use client'

import { [FeatureName]ListPage } from '@/components/[feature]'
import { use[FeatureName]List } from '@/src/hooks'
import { useState } from 'react'
import type { [FeatureName]Filters } from '@/src/types'

export default function [FeatureName]Page() {
  const [filters, setFilters] = useState<[FeatureName]Filters>({})
  const { items, loading, error, hasMore, loadMore } = use[FeatureName]List(filters)

  const handleFilterChange = (newFilters: [FeatureName]Filters) => {
    setFilters(newFilters)
  }

  return (
    <[FeatureName]ListPage
      items={items}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={loadMore}
      filters={filters}
      onFilterChange={handleFilterChange}
    />
  )
}
```

## Checklist Antes de Submeter

```typescript
// ✅ Página deve ter:
- [ ] Apenas hooks e componentes
- [ ] Sem lógica de negócio
- [ ] Sem chamadas diretas a APIs
- [ ] Sem fetch() ou prisma diretamente
- [ ] Tipos importados de @/src/types
- [ ] Componente página delegado ao components/
- [ ] Metadata configurada (se necessário)
- [ ] Error handling delegado ao componente
```

## Boas Práticas

1. **Nome de Função**: PascalCase + "Page"
   - ✅ `ClientesPage`
   - ❌ `clientesPage` ou `ClientPage`

2. **Importações**: Ordem específica
   ```typescript
   // Componentes do Next
   import { useRouter } from 'next/navigation'
   
   // Componentes da app
   import { ComponentName } from '@/components/[feature]'
   
   // Hooks
   import { useHook } from '@/src/hooks'
   
   // Types
   import type { TypeName } from '@/src/types'
   ```

3. **Props de Página**: Interface separada
   ```typescript
   interface PageProps {
     params: { id: string }
     searchParams: Record<string, string>
   }
   ```

4. **Metadata**: Sempre adicionar
   ```typescript
   export const metadata = {
     title: 'Página',
     description: 'Descrição'
   }
   ```
