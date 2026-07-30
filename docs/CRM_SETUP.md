# CRM Module - Guia de Setup

## Instalação

### 1. Dependências Necessárias

```bash
# Se ainda não tiver instalado
npm install @radix-ui/react-tabs @radix-ui/react-progress @radix-ui/react-checkbox @radix-ui/react-select recharts react-hook-form @hookform/resolvers zod
```

### 2. Preparar Banco de Dados

```bash
# Gerar cliente Prisma atualizado
npx prisma generate

# Criar migration com os novos modelos
npx prisma migrate dev --name add_crm_models

# Verificar schema
npx prisma studio
```

### 3. Estrutura de Arquivos

```
projeto/
├── app/crm/                    # Páginas do CRM
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pipeline/page.tsx
│   ├── leads/page.tsx
│   ├── oportunidades/page.tsx
│   ├── agenda/page.tsx
│   └── historico/page.tsx
│
├── components/crm/             # Componentes CRM
│   ├── *.tsx                   # 30+ componentes
│   └── index.ts
│
├── components/ui/              # Componentes UI base
│   ├── tabs.tsx
│   ├── progress.tsx
│   ├── alert.tsx
│   ├── checkbox.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   └── ...
│
├── src/
│   ├── lib/
│   │   ├── validations/crm.ts  # Schemas Zod
│   │   └── crm/utils.ts        # Utilitários
│   │
│   ├── modules/crm/
│   │   ├── types/index.ts      # TypeScript types
│   │   ├── actions/
│   │   │   ├── leads.ts        # Server actions
│   │   │   └── opportunities.ts
│   │   └── hooks/
│   │       └── usePipeline.ts
│   │
│   └── hooks/crm/
│       ├── usePipeline.ts
│       └── useLeadFilters.ts
│
└── prisma/
    └── schema.prisma           # Atualizado com CRM models
```

## Uso Básico

### Dashboard CRM

```tsx
import { CRMStatsCards, CRMAdvancedCharts } from '@/components/crm'

export default function CRMDashboard() {
  const stats = {
    leadsToday: 5,
    totalLeads: 120,
    totalOpportunities: 45,
    lostDeals: 3,
    pipelineValue: 450000,
    conversionRate: 37.5,
    closedDealsValue: 150000,
    avgDealValue: 10000,
    avgClosingDays: 15,
    negotiationCount: 12,
    monthlTarget: 500000,
    goalProgress: 90
  }

  return (
    <>
      <CRMStatsCards stats={stats} />
      <CRMAdvancedCharts 
        leadsBySource={[...]}
        salesByRep={[...]}
        monthlyEvolution={[...]}
        averageClosingTime={[...]}
      />
    </>
  )
}
```

### Lead Form

```tsx
import { LeadFormAdvanced } from '@/components/crm'

export default function NewLeadPage() {
  async function handleSubmit(data) {
    const response = await fetch('/api/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    // Handle response
  }

  return <LeadFormAdvanced onSubmit={handleSubmit} />
}
```

### Pipeline

```tsx
import { PipelineBoardAdvanced } from '@/components/crm'

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState([])

  async function handleCardMove(cardId, newStage) {
    const response = await fetch(`/api/crm/opportunities/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage })
    })
    // Atualizar UI
  }

  return (
    <PipelineBoardAdvanced
      opportunities={opportunities}
      onCardMove={handleCardMove}
      onCardClick={(id) => router.push(`/crm/oportunidades/${id}`)}
    />
  )
}
```

### Oportunidades

```tsx
import { OpportunityDetails } from '@/components/crm'

export default function OpportunityPage({ params }) {
  const [opportunity, setOpportunity] = useState(null)
  const [history, setHistory] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Buscar dados
    fetchOpportunity(params.id)
    fetchHistory(params.id)
    fetchActivities(params.id)
  }, [params.id])

  return (
    <OpportunityDetails
      opportunity={opportunity}
      history={history}
      activities={activities}
      quotes={[]}
      files={[]}
    />
  )
}
```

### Calendário

```tsx
import { CRMCalendar } from '@/components/crm'

export default function AgendaPage() {
  const [events, setEvents] = useState([])

  return (
    <CRMCalendar
      events={events}
      onEventClick={(id) => {}}
      onDateClick={(date) => {}}
    />
  )
}
```

## Implementar Server Actions

### Exemplo: Criar Lead

```typescript
// src/modules/crm/actions/leads.ts
'use server'

import { db } from '@/lib/db'
import { createLeadSchema } from '@/src/lib/validations/crm'
import { getSession } from '@/lib/auth'

export async function createLeadAction(data: unknown) {
  // Validar dados
  const validated = createLeadSchema.parse(data)
  
  // Verificar autenticação
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  // Criar lead no banco
  const lead = await db.lead.create({
    data: {
      companyId: session.user.companyId,
      ...validated,
      interests: validated.interests ? JSON.stringify(validated.interests) : null
    }
  })

  // Criar oportunidade automaticamente
  await db.opportunity.create({
    data: {
      companyId: session.user.companyId,
      leadId: lead.id,
      stage: 'NEW_LEAD',
      value: validated.estimatedValue || 0,
      probability: 10,
      responsibleId: validated.responsibleId
    }
  })

  // Registrar no histórico
  await db.cRMHistory.create({
    data: {
      companyId: session.user.companyId,
      leadId: lead.id,
      action: 'LEAD_CREATED',
      description: `Lead ${lead.name} criado`,
      userId: session.user.id
    }
  })

  return lead
}
```

### Uso no Componente

```tsx
'use client'

import { createLeadAction } from '@/src/modules/crm/actions/leads'
import { LeadFormAdvanced } from '@/components/crm'

export default function NewLeadPage() {
  async function handleSubmit(data) {
    try {
      const lead = await createLeadAction(data)
      toast.success('Lead criado com sucesso!')
      router.push(`/crm/leads/${lead.id}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return <LeadFormAdvanced onSubmit={handleSubmit} />
}
```

## API Routes

### Exemplo: GET /api/crm/leads

```typescript
// app/api/crm/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { leadFiltersSchema } from '@/src/lib/validations/crm'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Extrair query params
    const searchParams = req.nextUrl.searchParams
    const filters = leadFiltersSchema.parse({
      search: searchParams.get('search'),
      source: searchParams.get('source'),
      status: searchParams.get('status'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    // Buscar leads
    const leads = await db.lead.findMany({
      where: {
        companyId: session.user.companyId,
        OR: filters.search ? [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ] : undefined,
        ...(filters.source && { source: filters.source }),
        ...(filters.status && { status: filters.status })
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

## Segurança

### Validar Permissões

```typescript
// lib/auth/permissions.ts
export async function checkCRMAccess(userId: string, companyId: string) {
  const member = await db.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
    include: { role: { include: { permissions: true } } }
  })

  if (!member) throw new Error('Access denied')
  return member
}

// Usar em server actions
export async function updateOpportunityAction(id: string, data: unknown) {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  await checkCRMAccess(session.user.id, session.user.companyId)

  // Atualizar oportunidade...
}
```

## Testes

### Testar Validação

```typescript
import { createLeadSchema } from '@/src/lib/validations/crm'

describe('Lead Validation', () => {
  it('should validate complete lead data', () => {
    const data = {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      city: 'São Paulo',
      state: 'SP',
      source: 'GOOGLE'
    }
    expect(() => createLeadSchema.parse(data)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const data = {
      name: 'João Silva',
      email: 'invalid-email'
    }
    expect(() => createLeadSchema.parse(data)).toThrow()
  })
})
```

## Performance

### Otimizar Queries

```typescript
// ✅ Bom - com includes seletivos
const opportunities = await db.opportunity.findMany({
  where: { companyId },
  include: {
    lead: { select: { name: true, phone: true } },
    responsible: { select: { name: true } }
  },
  take: 20
})

// ❌ Ruim - sem paginação
const allOpportunities = await db.opportunity.findMany({
  where: { companyId },
  include: { lead: true, responsible: true, activities: true }
})
```

### Índices Recomendados

```prisma
// Já adicionados no schema:
@@index([companyId])
@@index([status])
@@index([createdAt])
@@index([leadId])
```

## Troubleshooting

### Erro: "Tabs component not found"
- Verificar se o arquivo `/components/ui/tabs.tsx` existe
- Executar `npm install @radix-ui/react-tabs`

### Erro: "Prisma models not found"
- Executar `npx prisma generate`
- Verificar se migration foi executada: `npx prisma migrate status`

### Erro de validação Zod
- Verificar o arquivo `/src/lib/validations/crm.ts`
- Testar schema no console: `schema.parse(data)`

## Recursos Adicionais

- Documentação Prisma: https://www.prisma.io/docs/
- Radix UI: https://www.radix-ui.com/
- Recharts: https://recharts.org/
- Zod: https://zod.dev/

---

**Suporte:** Consulte a documentação completa em `/docs/CRM_IMPLEMENTATION.md`
