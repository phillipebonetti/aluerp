# CRM Comercial — Quick Start

## Instalação

1. Executar migration:
```bash
npx prisma migrate dev --name add_crm_models
```

## Usar em Componentes

### Exibir Lead Card
```typescript
import { LeadCard } from '@/components/crm/lead-card'

<LeadCard 
  id="lead-123"
  name="João Silva"
  email="joao@email.com"
  phone="11987654321"
  city="São Paulo"
  source="INSTAGRAM"
  status="IN_CONTACT"
  value={5000}
/>
```

### Exibir Opportunity Card
```typescript
import { OpportunityCard } from '@/components/crm/opportunity-card'

<OpportunityCard 
  id="opp-123"
  leadName="João Silva"
  value={5000}
  probability={50}
  stage="QUOTED"
  expectedCloseDate={new Date('2024-02-15')}
/>
```

## Criar Lead

```typescript
import { createLeadAction } from '@/src/actions/crm'

const result = await createLeadAction({
  companyId: 'comp-123',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11987654321',
  source: 'INSTAGRAM', // enum LeadSource
  city: 'São Paulo',
  estimatedValue: 5000,
  responsibleId: 'emp-123',
  interests: JSON.stringify(['Portão', 'Box'])
})

if (result.success) {
  console.log('Lead criado:', result.data)
}
```

## Obter Leads

```typescript
import { getLeadsAction } from '@/src/actions/crm'

const result = await getLeadsAction(companyId, {
  status: 'IN_CONTACT',
  source: 'INSTAGRAM',
  responsible: 'emp-123'
})

if (result.success) {
  console.log('Leads:', result.data)
}
```

## Converter Lead em Oportunidade

```typescript
import { convertLeadToOpportunityAction } from '@/src/actions/crm'

await convertLeadToOpportunityAction(
  'lead-123',  // leadId
  'comp-123',  // companyId
  5000,        // value
  10           // initial probability (%)
)
```

## Obter Oportunidades

```typescript
import { getOpportunitiesAction } from '@/src/actions/crm'

const result = await getOpportunitiesAction(companyId, {
  stage: 'QUOTED',
  status: 'OPEN'
})
```

## Mover no Pipeline (Kanban)

```typescript
import { moveOpportunityAction } from '@/src/actions/crm'

await moveOpportunityAction(
  'opp-123',
  'MEASUREMENT'  // novo estágio
)
```

## Fechar Oportunidade

```typescript
import { closeOpportunityAction } from '@/src/actions/crm'

// Como ganha
await closeOpportunityAction('opp-123', 'WON')

// Como perdida (com motivo)
await closeOpportunityAction('opp-123', 'LOST', 'loss-reason-123')
```

## Registrar Atividade

```typescript
import { createActivityAction } from '@/src/actions/crm'

await createActivityAction({
  companyId: 'comp-123',
  type: 'CALL',           // CALL, WHATSAPP, EMAIL, VISIT, MEETING
  title: 'Retorno Cliente',
  description: 'Cliente interessado em medição',
  leadId: 'lead-123',
  result: 'Cliente agendou visita',
  nextAction: 'Fazer medição segunda-feira',
  createdBy: 'emp-123'
})
```

## Criar Meta

```typescript
import { createSalesGoalAction } from '@/src/actions/crm'

const now = new Date()

await createSalesGoalAction({
  companyId: 'comp-123',
  employeeId: 'emp-123',  // opcional, null = meta de equipe
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  revenueTarget: 50000,
  quantityTarget: 5,
  conversionTarget: 20  // percentual
})
```

## Obter Dashboard Stats

```typescript
import { getCRMDashboardStatsAction } from '@/src/actions/crm'

const stats = await getCRMDashboardStatsAction(companyId)

// {
//   leadsToday: 3,
//   openOpportunities: 15,
//   quotesThisMonth: 8,
//   goals: { ... },
//   metrics: { ... }
// }
```

## Calcular Métricas do Mês

```typescript
import { calculateMetricsAction } from '@/src/actions/crm'

await calculateMetricsAction(companyId, '2024-01')

// Calcula e salva:
// - Taxa de conversão
// - Receita total
// - Ticket médio
// - Tempo médio de fechamento
// - Leads por origem
```

## Enums Disponíveis

### LeadSource
```
INSTAGRAM, FACEBOOK, GOOGLE, SITE, INDICACAO, WHATSAPP, 
TELEFONE, LOJA_FISICA, FEIRRAO, CONSTRUTORA, ARQUITETO, OUTRO
```

### LeadStatus
```
NEW, IN_CONTACT, QUOTED, NEGOTIATING, CONVERTED, LOST
```

### OpportunityStage
```
NEW_LEAD, CONTACT_MADE, VISIT_SCHEDULED, MEASUREMENT, 
QUOTED, NEGOTIATING, CLOSED_WON, CLOSED_LOST
```

### ActivityType
```
CALL, WHATSAPP, EMAIL, VISIT, MEETING, MESSAGE
```

### GoalStatus
```
NOT_STARTED, IN_PROGRESS, ACHIEVED, EXCEEDED, FAILED
```

### PostSaleStatus
```
IN_PROGRESS, WARRANTY_ACTIVE, WARRANTY_EXPIRED, 
MAINTENANCE_SCHEDULED, COMPLETED, PROBLEM_REPORTED
```

## Padrões de Uso

### Fluxo Típico

1. Criar Lead
```typescript
const lead = await createLeadAction({ ... })
```

2. Registrar Atividades
```typescript
await createActivityAction({ 
  leadId: lead.id, 
  type: 'CALL'
})
```

3. Converter em Oportunidade
```typescript
const opp = await convertLeadToOpportunityAction(
  lead.id, companyId, 5000
)
```

4. Mover no Pipeline
```typescript
await moveOpportunityAction(opp.id, 'MEASUREMENT')
```

5. Fechar como Ganha
```typescript
await closeOpportunityAction(opp.id, 'WON')
// Isso cria: Cliente → Ordem de Serviço → Obra
```

## Filtros Disponíveis

### getLeadsAction
```typescript
{
  status?: 'NEW' | 'IN_CONTACT' | 'QUOTED' | 'NEGOTIATING' | 'CONVERTED' | 'LOST'
  source?: string // LeadSource
  responsible?: string // employeeId
}
```

### getOpportunitiesAction
```typescript
{
  stage?: string // OpportunityStage
  status?: string // 'OPEN' | 'CLOSED_WON' | 'CLOSED_LOST'
}
```

### getActivitiesAction
```typescript
{
  leadId?: string
  opportunityId?: string
}
```

## Troubleshooting

### Lead não aparece nas métricas
- Verificar se source está setado
- Verificar se createdAt está com data correta

### Oportunidade não move
- Verificar se estágio existe no enum OpportunityStage
- Verificar companyId

### Meta não atualiza
- Usar `updateGoalProgress` com valores corretos
- Verificar se mês/ano correspondem à meta criada

## Documentação Completa

Ver: `SPRINT_19_CRM_COMERCIAL.md`
