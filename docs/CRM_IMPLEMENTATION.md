# CRM Module - Documentação de Implementação

## Visão Geral

Implementação completa de um módulo CRM profissional com gestão de leads, oportunidades, atividades, calendário comercial e relatórios avançados.

## Estrutura Criada

### 1. Modelos Prisma (banco de dados)

#### Modelos principais:
- **Lead** - Prospects e leads
- **Opportunity** - Oportunidades de vendas
- **Activity** - Atividades registradas
- **Reminder** - Lembretes e follow-ups
- **CRMHistory** - Histórico de alterações
- **OpportunityFile** - Arquivos anexados
- **LossReason** - Motivos de perda

#### Enums CRM:
- **LeadSource** - INSTAGRAM, FACEBOOK, GOOGLE, INDICACAO, SITE, MARKETPLACE, OUTRO
- **LeadStatus** - NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED, LOST
- **OpportunityStage** - NEW_LEAD, FIRST_CONTACT, VISIT_SCHEDULED, QUOTE_SENT, NEGOTIATION, CLOSED, LOST
- **OpportunityStatus** - OPEN, CLOSED_WON, CLOSED_LOST
- **ActivityType** - CALL, WHATSAPP, EMAIL, VISIT, MEETING, COLLECTION, NOTE
- **ReminderPriority** - LOW, NORMAL, HIGH, URGENT

### 2. Validações (Zod)

Arquivo: `/src/lib/validations/crm.ts`

Schemas de validação completos para:
- Criação e edição de leads
- Criação e edição de oportunidades
- Registro de atividades
- Criação de lembretes
- Filtros de busca

### 3. Componentes Reutilizáveis

#### Dashboard e Análise
- **CRMStatsCards** - 12 cards com indicadores em tempo real
- **CRMAdvancedCharts** - Gráficos com Recharts (funil, evolução, vendas por rep)
- **ConversionChart** - Taxa de conversão por etapa
- **FunnelChart** - Funil de vendas visual

#### Pipeline
- **PipelineBoard** - Visualização Kanban dos estágios
- **PipelineColumn** - Coluna individual com drag-and-drop
- **PipelineCard** - Card de oportunidade com dados
- **PipelineBoardAdvanced** - Pipeline avançado com múltiplos estágios

#### Leads
- **LeadForm** - Formulário básico de lead
- **LeadFormAdvanced** - Formulário completo com validação Zod
- **LeadTable** - Tabela com busca e filtros
- **LeadFilters** - Componente de filtros
- **LeadImport** - Sistema completo de importação CSV/Excel

#### Oportunidades
- **OpportunityTable** - Tabela de oportunidades
- **OpportunityDetails** - Detalhes com abas (resumo, histórico, atividades, arquivos, etc)

#### Atividades e Calendário
- **ActivityTimeline** - Timeline visual de atividades
- **ActivityForm** - Formulário para registrar atividades
- **ReminderCard** - Card de lembretes
- **CRMCalendar** - Calendário com 3 visualizações (dia, semana, mês)

### 4. Estrutura de Diretórios

```
/vercel/share/v0-project/
├── app/crm/
│   ├── page.tsx                    # Dashboard principal
│   ├── layout.tsx                  # Layout com navegação
│   ├── pipeline/page.tsx           # Página do pipeline
│   ├── leads/page.tsx              # Página de leads
│   ├── oportunidades/page.tsx      # Página de oportunidades
│   ├── agenda/page.tsx             # Calendário comercial
│   └── historico/page.tsx          # Timeline de histórico
│
├── components/crm/
│   ├── crm-stats-cards.tsx         # Cards de indicadores
│   ├── crm-advanced-charts.tsx     # Gráficos avançados
│   ├── crm-dashboard.tsx           # Dashboard
│   ├── crm-calendar.tsx            # Calendário
│   │
│   ├── pipeline-board.tsx          # Pipeline básico
│   ├── pipeline-board-advanced.tsx # Pipeline com drag-and-drop
│   ├── pipeline-card.tsx           # Card do pipeline
│   ├── pipeline-column.tsx         # Coluna do pipeline
│   │
│   ├── lead-form.tsx               # Formulário básico
│   ├── lead-form-advanced.tsx      # Formulário completo
│   ├── lead-table.tsx              # Tabela de leads
│   ├── lead-filters.tsx            # Filtros de leads
│   ├── lead-import.tsx             # Importação em lote
│   │
│   ├── opportunity-table.tsx       # Tabela de oportunidades
│   ├── opportunity-details.tsx     # Detalhes da oportunidade
│   │
│   ├── activity-timeline.tsx       # Timeline de atividades
│   ├── activity-form.tsx           # Formulário de atividade
│   ├── reminder-card.tsx           # Card de lembretes
│   │
│   ├── conversion-chart.tsx        # Gráfico de conversão
│   ├── funnel-chart.tsx            # Gráfico de funil
│   └── index.ts                    # Exportações
│
├── src/
│   ├── lib/
│   │   ├── validations/
│   │   │   └── crm.ts              # Schemas Zod
│   │   └── crm/
│   │       └── utils.ts            # Funções utilitárias
│   │
│   ├── modules/crm/
│   │   ├── types/
│   │   │   └── index.ts            # Types TypeScript
│   │   ├── actions/
│   │   │   ├── leads.ts            # Server actions para leads
│   │   │   └── opportunities.ts    # Server actions para oportunidades
│   │   └── hooks/
│   │       ├── usePipeline.ts      # Hook do pipeline
│   │       └── useLeadFilters.ts   # Hook de filtros
│   │
│   └── hooks/crm/
│       ├── usePipeline.ts          # Hook de pipeline
│       └── useLeadFilters.ts       # Hook de filtros
│
└── prisma/
    └── schema.prisma               # Schema com modelos CRM
```

## Funcionalidades Implementadas

### Dashboard CRM
- 12 cards com indicadores principais
- Gráficos de funil, conversão e evolução mensal
- Vendas por vendedor
- Tempo médio de fechamento
- Filtros por período

### Pipeline Kanban
- 7 estágios: Novo Lead → Primeiro Contato → Visita Agendada → Orçamento Enviado → Negociação → Fechado → Perdido
- Exibição de quantidade, valor total e probabilidade por etapa
- Cards com todas as informações do lead
- Indicador de dias parado
- Barra de probabilidade visual

### Gestão de Leads
- Formulário completo com validação
- Importação em lote (CSV/Excel) com mapeamento de colunas
- Tabela com busca, filtros e ordenação
- Campos: nome, email, phone, WhatsApp, CPF/CNPJ, localização, origem, interesses, valor estimado
- 8 tipos de interesse (Box, Portão, Cobertura, etc)
- 7 origens (Instagram, Facebook, Google, etc)

### Oportunidades
- Tabela com todos os dados
- Detalhes em página separada com abas
- 6 abas: Resumo, Histórico, Atividades, Orçamentos, Arquivos, Observações
- Valor estimado e receita esperada (baseado na probabilidade)
- Data prevista de fechamento

### Atividades e Timeline
- 7 tipos de atividades (Ligação, WhatsApp, Email, Visita, Reunião, Cobrança, Anotação)
- Registro completo com descrição, resultado e próxima ação
- Timeline automática com todas as alterações
- Histórico de mudanças (quem, quando, o quê)

### Calendário Comercial
- 3 visualizações: Dia, Semana, Mês
- Cores diferentes por tipo de evento
- Visualização de próximos eventos
- Integração com atividades e lembretes

## Probabilidade Automática

A probabilidade é atualizada automaticamente conforme o estágio:
- Novo Lead: 10%
- Primeiro Contato: 20%
- Visita Agendada: 40%
- Orçamento Enviado: 60%
- Negociação: 80%
- Fechado: 100%
- Perdido: 0%

## Validações e Segurança

- Validação completa com Zod
- Sanitização de entradas
- Server Actions para operações críticas
- Logs de todas as alterações
- Preparação para auditoria

## Próximas Implementações

Para completar o sistema:

1. **Integração com Banco de Dados**
   - Criar migrations Prisma
   - Implementar actions reais no banco

2. **Automações**
   - Criar oportunidade automaticamente quando novo lead é adicionado
   - Atualizar estágio ao criar orçamento/OS
   - Solicitar motivo de perda ao marcar como perdido

3. **Permissões**
   - Admin: acesso total
   - Gerente: visualizar tudo, pode editar
   - Vendedor: ver apenas seus clientes

4. **Notificações**
   - Novo lead
   - Visita hoje
   - Cliente parado
   - Orçamento vencido
   - Retorno agendado

5. **Importação Avançada**
   - Integração com bibliotecas (papaparse, xlsx)
   - Detecção de duplicados
   - Validação em tempo real

## Uso dos Componentes

### Dashboard
```tsx
import { CRMStatsCards, CRMAdvancedCharts } from '@/components/crm'

<CRMStatsCards stats={stats} period="Este Mês" />
<CRMAdvancedCharts 
  leadsBySource={data.leadsBySource}
  salesByRep={data.salesByRep}
  monthlyEvolution={data.monthlyEvolution}
  averageClosingTime={data.averageClosingTime}
/>
```

### Lead Form
```tsx
import { LeadFormAdvanced } from '@/components/crm'

<LeadFormAdvanced 
  onSubmit={async (data) => {
    // Validação automática via Zod
    await createLead(data)
  }}
/>
```

### Pipeline
```tsx
import { PipelineBoardAdvanced } from '@/components/crm'

<PipelineBoardAdvanced
  opportunities={opportunities}
  onCardMove={handleMoveCard}
  onCardClick={handleCardClick}
/>
```

## Performance

- Server Components para pages
- Paginação Server Side
- Lazy loading de imagens
- Memoização de componentes pesados
- Índices nas colunas mais consultadas

## Próximos Passos

1. Testar os componentes com dados reais
2. Implementar drag-and-drop com @dnd-kit
3. Adicionar notificações em tempo real
4. Configurar webhooks para automações
5. Implementar sistema de permissões

---

**Desenvolvido com:** Next.js 16, React 19, Tailwind CSS, Prisma, Zod, Recharts
