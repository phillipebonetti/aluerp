# SPRINT GO LIVE 2 — Módulo de Vendedores e Comissões

## Objetivo

Implementar um módulo completo de Vendedores e Comissões, integrado com Clientes, Orçamentos, Ordens de Serviço e Financeiro, permitindo controlar metas, vendas e pagamentos de comissão de forma automática.

## Arquitetura Existente Reutilizável

### Modelos Já Existentes
- ✅ **Employee** - Base para vendedor (tem `commissionRate` e `status`)
- ✅ **SalesGoal** - Metas mensais por vendedor
- ✅ **OSCommission** - Comissões por OS (GO LIVE 1B)
- ✅ **Quote** - Orçamentos com relação a Employee (salesperson)
- ✅ **ServiceOrder** - Ordens com vendedor

### Padrões a Reutilizar
- Components: shadcn/ui (Table, Badge, Dialog, Form, etc)
- Services: Server Actions + Services Layer
- Validation: Zod schemas
- Auth: Middleware existente
- Types: TypeScript strict mode

## Implementação por Fase

### Fase 1: Database Expansion (2h)
**O que expandir:**
- Adicionar campos ao Employee para Salesperson completo
- Criar CommissionPayment model
- Criar CommissionRule model
- Criar CommissionHistory/AuditLog
- Expandir OSCommission com mais campos

**Resultado:** 4 novos modelos, 2 modelos expandidos

### Fase 2: Cadastro de Vendedores (2h)
**Criar:**
- Página de listagem (`/app/(app)/vendedores/page.tsx`)
- Página de novo (`/app/(app)/vendedores/novo/page.tsx`)
- Página de edição (`/app/(app)/vendedores/[id]/page.tsx`)
- Componentes: VendedorTable, VendedorForm
- Server Actions: CRUD completo

**Resultado:** 3 páginas, 2 componentes, 5 server actions

### Fase 3: Comissão Automática (3h)
**Implementar:**
- Service: CommissionCalculationService
- Trigger automático ao gerar OS
- Webhook/Event ao aprovar Quote
- Cálculo baseado em regras
- Server Actions para operações manuais

**Resultado:** 1 service (200+ linhas), 4 server actions

### Fase 4: Dashboard de Vendedores (2.5h)
**Criar:**
- Dashboard com 6 KPIs
- 4 gráficos (Vendas, Comissões, Evolução, Ranking)
- Cards com indicadores
- Listagem de top vendedores

**Resultado:** 1 página dashboard, 3 componentes, 1 service

### Fase 5: Tela de Comissão (2h)
**Criar:**
- Página de listagem (`/app/(app)/comissoes/page.tsx`)
- Tabela com todas as informações
- Filtros avançados
- Ações: Liberar, Pagar, Estornar
- Confirmações e validações

**Resultado:** 1 página, 2 componentes, 5 server actions

### Fase 6: Integração com Financeiro (2h)
**Implementar:**
- Webhook ao marcar comissão como paga
- Criar Expense automaticamente
- Atualizar Cash Flow
- Registro em histórico
- Notificações

**Resultado:** 1 service, 3 server actions, integração com Financial

### Fase 7: Metas (1.5h)
**Criar:**
- Dashboard de metas
- Barra de progresso visual
- Indicadores de performance
- Comparativo com período anterior

**Resultado:** 1 componente, 1 página, 1 service

### Fase 8: Histórico e Auditoria (2h)
**Implementar:**
- Model CommissionHistory
- Registro automático de todas as operações
- Página de auditoria
- Trails completos

**Resultado:** 1 modelo, 1 service, 1 página, 1 componente

## Arquivos a Criar/Modificar

### Database
- `prisma/schema.prisma` - Expansão models

### Backend Services
- `src/lib/services/salesperson-service.ts` - CRUD vendedor
- `src/lib/services/commission-service.ts` - Comissões
- `src/lib/services/commission-calculation-service.ts` - Cálculos
- `src/lib/services/commission-audit-service.ts` - Auditoria

### Server Actions
- `app/actions/salesperson.ts` - CRUD vendedor
- `app/actions/commission.ts` - CRUD comissão
- `app/actions/commission-goals.ts` - Metas

### Components
- `components/salesperson/salesperson-table.tsx`
- `components/salesperson/salesperson-form.tsx`
- `components/commission/commission-table.tsx`
- `components/commission/commission-card.tsx`
- `components/goals/goals-progress.tsx`
- `components/goals/goals-dashboard.tsx`

### Pages
- `app/(app)/vendedores/page.tsx` - Listagem
- `app/(app)/vendedores/novo/page.tsx` - Novo
- `app/(app)/vendedores/[id]/page.tsx` - Edição
- `app/(app)/comissoes/page.tsx` - Listagem comissões
- `app/(app)/vendedores/dashboard/page.tsx` - Dashboard
- `app/(app)/metas/page.tsx` - Metas

### Types & Schemas
- `src/types/salesperson.ts` - Tipos
- `src/lib/schemas/salesperson.ts` - Zod schemas

### Documentação
- GO_LIVE_2_PROGRESS.md
- GO_LIVE_2_IMPLEMENTATION.md
- GO_LIVE_2_FINAL_DELIVERY.md

## Critérios de Aceite

✅ Cadastro completo de vendedores  
✅ Comissão calculada automaticamente ao gerar a OS  
✅ Controle de status da comissão  
✅ Dashboard de desempenho dos vendedores  
✅ Controle de metas  
✅ Integração automática com Financeiro  
✅ Histórico completo de alterações  
✅ Interface responsiva e consistente  
✅ TypeScript, React Hook Form, Zod, Server Actions  
✅ Sem regressões, pronto para produção  

## Timeline Estimada

**Total: 17 horas**
- Fase 1: 2h
- Fase 2: 2h
- Fase 3: 3h
- Fase 4: 2.5h
- Fase 5: 2h
- Fase 6: 2h
- Fase 7: 1.5h
- Fase 8: 2h

**Distribuição: 3-4 dias em sprint continuo**

## Dependências

- GO LIVE 1A (Ordem de Serviço) - 100% completo ✅
- GO LIVE 1B (Funcionalidades avançadas) - 100% completo ✅
- Employee e SalesGoal models - Já existem ✅
- Financial module - Será integrado ✅
