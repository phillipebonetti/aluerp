# Sprint GO LIVE 1A - Ordem de Serviço (OS) - Status de Implementação

**Objetivo**: Implementar módulo completo de Ordem de Serviço funcional para Aleeds

**Data Início**: Agosto 2026
**Status**: 60% Completo
**ETA Conclusão**: 1-2 dias

---

## Progresso por Fase

### ✅ Fase 1: Expandir Schema Prisma (COMPLETA)

**Status**: 100% ✓

**Implementado**:
- Expandido model `ServiceOrder` com 12 novos campos:
  - `quoteId` - Referência ao orçamento
  - `clientId`, `vendedorId` - Relações
  - `priority`, `totalValue`, `downPayment`, `balance`, `installments` - Dados financeiros
  - `createdBy`, `updatedBy` - Auditoria
  
- Criados 6 novos modelos auxiliares:
  1. **OSProduct** - Produtos/Serviços da OS (sequence, description, quantity, width, height, area, unitValue, totalValue, notes)
  2. **OSProductionStage** - Etapas de Produção (sequence, name, status, responsible, dates)
  3. **OSInstallation** - Instalação (teamLead, schedule, location, contact)
  4. **OSComment** - Timeline/Comentários (type, content, author)
  5. **OSAttachment** - Anexos (fileName, fileUrl, category)
  6. **[Adicional em Progress]** - Estrutura pronta para Material, QA, etc.

- Atualizadas relações em:
  - Employee (serviceOrders, osInstallations)
  - Client (serviceOrders)
  - Quote (serviceOrders)
  - Company (serviceOrders)

- Total de índices: 40+ para performance

---

### ✅ Fase 2: Services e Utilities (COMPLETA)

**Status**: 100% ✓

**Arquivos Criados**:

1. **`src/types/os.ts`** (270+ linhas)
   - Tipos completos: `ServiceOrderStatus`, `ServiceOrderPriority`, `ProductionStageStatus`, `OSCommentType`, `AttachmentCategory`
   - Interfaces para todos os 6 modelos
   - DTOs para criar/atualizar
   - `OSDashboardMetrics`, `OSListFilters`
   - Workflow definition

2. **`src/lib/schemas/os.ts`** (134 linhas)
   - Zod schemas para validação:
     - `CreateOSSchema`, `UpdateOSSchema`
     - `CreateOSProductSchema`
     - `CreateProductionStageSchema`, `UpdateProductionStageSchema`
     - `CreateInstallationSchema`, `CreateCommentSchema`
     - `OSListFiltersSchema`, `BulkChangeStatusSchema`, `DuplicateOSSchema`
   - Validação de CPF, telefone, CEP incluída

3. **`src/lib/services/os-service.ts`** (363 linhas)
   - Class `OSService` com métodos:
     - `generateNextNumber()` - Numeração automática de OS
     - `createServiceOrder()` - Criar OS
     - `listServiceOrders()` - Listar com filtros avançados
     - `getServiceOrderById()` - Obter com todas relações
     - `updateStatus()` - Mudar status
     - `generateFromQuote()` - Gerar OS a partir de orçamento
     - `addComment()` - Adicionar comentário
     - `getDashboardMetrics()` - KPIs do dashboard
     - `getOSByStatus()`, `getOSByVendedor()` - Para gráficos
     - `duplicateOS()` - Duplicar OS
     - `deleteServiceOrder()` - Soft delete

---

### ✅ Fase 3: Server Actions (COMPLETA)

**Status**: 100% ✓

**Arquivo**: `app/actions/os.ts` (327 linhas)

**Implementadas 19 server actions**:

1. **CRUD Principal**:
   - `createServiceOrder()` - Criar nova OS
   - `updateServiceOrder()` - Atualizar OS
   - `deleteServiceOrder()` - Deletar (soft delete)
   - `getServiceOrder()` - Obter uma OS
   - `listServiceOrders()` - Listar com filtros

2. **Gerenciamento de Status**:
   - `changeServiceOrderStatus()` - Mudar status de uma OS
   - `bulkChangeStatus()` - Mudar status em múltiplas OSs

3. **Produtos/Serviços**:
   - `addOSProduct()` - Adicionar produto
   - `updateOSProduct()` - Atualizar produto
   - `deleteOSProduct()` - Deletar produto

4. **Etapas de Produção**:
   - `addProductionStage()` - Adicionar etapa
   - `updateProductionStage()` - Atualizar etapa
   - `deleteProductionStage()` - Deletar etapa

5. **Instalação**:
   - `addInstallation()` - Adicionar instalação
   - `updateInstallation()` - Atualizar instalação

6. **Comentários & Timeline**:
   - `addOSComment()` - Adicionar comentário

7. **Fluxos Especiais**:
   - `generateOSFromQuote()` - Gerar OS a partir de orçamento
   - `duplicateServiceOrder()` - Duplicar OS existente

8. **Dashboard**:
   - `getOSDashboardMetrics()` - Obter KPIs
   - `getOSByStatus()` - Agrupar por status
   - `getOSByVendedor()` - Agrupar por vendedor

---

### 🟡 Fase 4: Componentes UI (60% - EM PROGRESSO)

**Status**: 60% - 3 de 5 componentes principais criados

**Implementados**:

1. **`components/os/os-form.tsx`** (294 linhas) ✓
   - Formulário completo para criar/editar OS
   - Campos: Cliente, Vendedor, Prioridade, Status, Data, Descrição
   - Financeiro: Valor Total, Entrada, Parcelas
   - React Hook Form + Zod validation
   - UI com shadcn/ui components

2. **`components/os/os-table.tsx`** (115 linhas) ✓
   - Tabela para listar OSs
   - Colunas: Número, Cliente, Vendedor, Status, Prioridade, Data, Valor
   - Ações: Ver, Editar, Deletar
   - Status badges coloridas
   - Suporte a callbacks para ações

3. **`components/os/os-products-tab.tsx`** (284 linhas) ✓
   - Aba de Produtos/Serviços
   - Dialog para adicionar novo produto
   - Tabela com: Descrição, Quantidade, Dimensões, Valor Unit., Total
   - Cálculo automático de área (width × height)
   - Subtotal agregado
   - Delete inline com confirmação

**Faltam - 2 componentes principais**:

4. **`components/os/os-production-tab.tsx`** (A fazer)
   - Aba de Produção
   - Lista de etapas com status
   - Responsável por etapa
   - Timeline de datas
   - Drag-and-drop (nice-to-have)

5. **`components/os/os-installation-tab.tsx`** (A fazer)
   - Aba de Instalação
   - Líder de equipe
   - Endereço e contato
   - Data agendada
   - Checklist (nice-to-have)

6. **`components/os/os-comments-tab.tsx`** (A fazer - rápido)
   - Aba de Comentários/Timeline
   - Timeline automática com comentários
   - Adicionar novo comentário
   - Filtro por tipo (COMMENT, STATUS_CHANGE, etc)

---

### ⏳ Fase 5: Páginas (A FAZER)

**Status**: 0% - Não iniciada

**Necessário**:

1. **`app/(app)/os/page.tsx`**
   - Listagem de OSs
   - Filtros: Cliente, Vendedor, Status, Período
   - Busca rápida
   - Paginação
   - Botão "Nova OS"
   - Botão "Gerar de Orçamento"

2. **`app/(app)/os/novo/page.tsx`**
   - Página para criar nova OS
   - Usar componente OSForm

3. **`app/(app)/os/[id]/page.tsx`**
   - Página de detalhes da OS
   - 7 abas (Geral, Produtos, Produção, Instalação, Financeiro, Comentários, Anexos)
   - Ações: Editar, Duplicar, Cancelar, Alterar Status
   - Timeline automática

4. **`app/(app)/os/[id]/editar/page.tsx`**
   - Página para editar OS existente

---

### ⏳ Fase 6: Integração Quote→OS (A FAZER)

**Status**: 0% - Estrutura pronta, implementação pendente

**Necessário**:

1. **Botão em `components/quote/quote-view.tsx`**
   - Botão "Gerar Ordem de Serviço"
   - Apenas disponível quando status = "APPROVED"
   - Abre dialog de confirmação
   - Chama `generateOSFromQuote()`

2. **Dialog de confirmação**
   - Mostra resumo do orçamento
   - Permite editar alguns campos antes de criar
   - Confirmação e criação

3. **Cópia automática de dados**
   - Cliente ✓ (server action já implementa)
   - Obra ✓ (server action já implementa)
   - Itens ✓ (server action já implementa)
   - Valores ✓ (server action já implementa)
   - Vendedor ✓ (server action já implementa)

---

### ⏳ Fase 7: Dashboard (A FAZER)

**Status**: 0% - Queries prontas, UI pendente

**Necessário**:

1. **`app/(app)/os/dashboard/page.tsx`**
   - KPI Cards com:
     - Total de OS
     - Em Produção (count)
     - Em Instalação (count)
     - Concluídas (count)
     - Atrasadas (count)
     - Valor em Produção

2. **Gráficos** (Recharts):
   - **Pie Chart**: OS por Status
   - **Bar Chart**: OS por Vendedor
   - **Line Chart**: Valor em produção (últimos 30 dias)
   - **Progress Bar**: Taxa de conclusão

3. **Filtros avançados**:
   - Período (Mês/Ano)
   - Vendedor
   - Status
   - Prioridade

---

## O que Está Pronto para Usar

### ✅ Banco de Dados
- Schema completo com 6 novos modelos
- Índices otimizados
- Relações normalizadas
- Migrations prontas (requer: `npx prisma migrate dev --name add_os_models`)

### ✅ Lógica de Negócio
- 11 server actions implementadas
- Services com toda lógica de CRUD
- Validação com Zod
- Geração automática de números
- Fluxo Quote→OS automatizado

### ✅ UI/UX Base
- 3 componentes principais criados
- Formulário completo
- Tabela com ações
- Gerenciar produtos

### ⚠️ Em Progresso
- 2 componentes de abas (Produção, Instalação)
- 1 componente de timeline (Comentários)
- 4 páginas principais
- 1 integração Quote→OS
- 1 dashboard

---

## Próximas Ações (Ordem de Prioridade)

### HOJE - CRÍTICO (2-3 horas)
1. Completar componentes de abas (Produção, Instalação, Comentários) - 1.5h
2. Criar 4 páginas principais (listagem, novo, detalhes, editar) - 1.5h

### AMANHÃ - IMPORTANTE (2-3 horas)
1. Integração Quote→OS com botão em quote pages - 1h
2. Dashboard com KPIs e gráficos - 1.5h

### VALIDAÇÃO (1-2 horas)
1. Testes E2E de fluxo completo
2. Testes de performance
3. Testes de validação de dados

---

## Comandos Úteis

```bash
# Rodar migrations
npx prisma migrate dev --name add_os_models

# Regenerar Prisma client
npx prisma generate

# Verificar schema
npx prisma db push

# Abrir Prisma Studio
npx prisma studio
```

---

## Checklist Final de GO LIVE

- [ ] Schema Prisma validado
- [ ] Migrations executadas
- [ ] Server actions testadas
- [ ] Componentes UI completos
- [ ] Páginas criadas
- [ ] Integração Quote→OS funcional
- [ ] Dashboard operacional
- [ ] Testes E2E passou
- [ ] Documentação atualizada
- [ ] Deploy em staging
- [ ] Deploy em produção

---

## Notas Técnicas

- Prisma Client gerado: `lib/generated/prisma`
- Padrão de erro handling: try/catch com console.error
- Validação: Zod schemas + React Hook Form
- UI: shadcn/ui + Tailwind CSS
- Formato de data: `formatDate()` de `lib/utils`
- Formato de moeda: `formatCurrency()` de `lib/utils`

---

**Status Geral**: 60% - Grande progresso, faltam paginas e dashboard
**Estimativa de Conclusão**: 4-6 horas de desenvolvimento focado

