# PLANO DE GO LIVE - ALUERP ALEEDS

**Objetivo:** Levar o AluERP para produção em 1-2 semanas com foco em Aleeds Alumínio e Vidro

**Status Atual:** 72/100 (75% completo) - 🟡 VIÁVEL COM RESSALVAS

---

## TAREFAS CRÍTICAS (IMPLEMENTAR ANTES DE GO LIVE)

Total: ~18 horas de desenvolvimento

### 1️⃣ ORDENS DE SERVIÇO - UI (2-3 horas) ⚠️ CRÍTICO

**Por quê**: Módulo sem interface, impossível usar

**O que fazer**:
- [ ] Criar rota `/app/(app)/ordens-de-servico`
- [ ] Criar página de listagem com table genérica
- [ ] Criar formulário de criação/edição
- [ ] Integrar com Project e ServiceOrder model

**Arquivos a criar**:
- `app/(app)/ordens-de-servico/page.tsx` (lista)
- `app/(app)/ordens-de-servico/[id]/page.tsx` (detalhes)
- `app/(app)/ordens-de-servico/novo/page.tsx` (criar)
- `components/servico-ordem/form.tsx` (form)
- `components/servico-ordem/table.tsx` (table)

---

### 2️⃣ EXPORTAÇÃO PDF (4-5 horas) ⚠️ CRÍTICO

**Por quê**: Necessário para orçamentos e relatórios serem úteis

**O que fazer**:
- [ ] Instalar lib PDF (jsPDF ou similar)
- [ ] Criar API `/api/pdf/quote` para exportar orçamento
- [ ] Criar API `/api/pdf/report` para exportar relatório
- [ ] Adicionar botão de download em Quote e Dashboard

**Arquivos a criar**:
- `app/api/pdf/quote/route.ts`
- `app/api/pdf/report/route.ts`
- `src/lib/pdf-generator.ts`
- Modificar `components/quote/view.tsx` (adicionar botão)
- Modificar `components/dashboard/kpi-card.tsx` (adicionar botão)

---

### 3️⃣ CONTAS A RECEBER - UI (2-3 horas) ⚠️ IMPORTANTE

**Por quém**: Visibilidade de recebimentos

**O que fazer**:
- [ ] Criar rota `/app/(app)/contas-receber`
- [ ] Criar dashboard com vencimentos
- [ ] Listar transações com type=INCOME
- [ ] Filtro por cliente, vencimento, status

**Arquivos a criar**:
- `app/(app)/contas-receber/page.tsx`
- `components/contas-receber/dashboard.tsx`
- `components/contas-receber/table.tsx`
- `components/contas-receber/filters.tsx`

---

### 4️⃣ CONTAS A PAGAR - UI (2-3 horas) ⚠️ IMPORTANTE

**Por quê**: Visibilidade de pagamentos

**O que fazer**:
- [ ] Criar rota `/app/(app)/contas-pagar`
- [ ] Criar dashboard com vencimentos
- [ ] Listar transações com type=EXPENSE
- [ ] Filtro por fornecedor, vencimento, status

**Arquivos a criar**:
- `app/(app)/contas-pagar/page.tsx`
- `components/contas-pagar/dashboard.tsx`
- `components/contas-pagar/table.tsx`
- `components/contas-pagar/filters.tsx`

---

### 5️⃣ FLUXO DE CAIXA - DASHBOARD (3-4 horas) ⚠️ IMPORTANTE

**Por quê**: Visão crítica de caixa

**O que fazer**:
- [ ] Criar dashboard com gráfico de fluxo
- [ ] Aggregar Transaction (income - expense) por período
- [ ] Mostrar previsão de caixa
- [ ] Saldo atual vs. anterior

**Arquivos a criar**:
- `app/(app)/fluxo-caixa/page.tsx`
- `components/fluxo-caixa/dashboard.tsx`
- `components/fluxo-caixa/chart.tsx`
- `src/lib/fluxo-caixa-service.ts` (queries)

---

### 6️⃣ MODEL COMMISSION (1 hora) 🔴 CRÍTICO

**Por quê**: Rastreamento de comissões de vendedores

**O que fazer**:
- [ ] Adicionar ao Prisma schema modelo `Commission`
  ```prisma
  model Commission {
    id            String
    opportunityId String
    employeeId    String
    rate          Decimal
    amount        Decimal
    status        String  // CALCULATED, APPROVED, PAID
    createdAt     DateTime
    updatedAt     DateTime
  }
  ```
- [ ] Executar migration

**Por quê**: Sem isso, não há auditoria de comissões

---

## TAREFAS IMPORTANTES (FAZER NA PRIMEIRA SEMANA)

Total: ~4 horas

### SEGURANÇA

- [ ] Implementar CSRF protection (1h)
- [ ] Rate limiting em login (1h)
- [ ] Confirmação de ações perigosas (1h)
- [ ] Validação de email (1h)

---

## TAREFAS DEPOIS DE GO LIVE (BACKLOG)

- [ ] 2FA (autenticação de dois fatores)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Kanban visual para tarefas
- [ ] Gantt chart para projetos
- [ ] Integração bancária automática
- [ ] Webhook para eventos
- [ ] Cache layer
- [ ] Refatoração de componentes (eliminar duplicação)

---

## ROADMAP GO LIVE

### SEMANA 1: Implementação Crítica

**Segunda-feira**: Ordens de Serviço + PDF (5-6 horas)
**Terça-feira**: Contas a Receber + Contas a Pagar (4-5 horas)
**Quarta-feira**: Fluxo de Caixa + Commission model (4-5 horas)
**Quinta-feira**: Testes E2E (4-5 horas)
**Sexta-feira**: Deploy staging + Correções (4-5 horas)

**Total Semana 1**: ~22 horas

### SEMANA 2: Validação & Production

**Segunda-feira**: Testes de carga (2-3 horas)
**Terça-feira**: Security hardening (2-3 horas)
**Quarta-feira**: Configuração de backup (1-2 horas)
**Quinta-feira**: Treinamento para time Aleeds (2-3 horas)
**Sexta-feira**: GO LIVE para PRODUÇÃO ✅

---

## CHECKLIST PRÉ-PRODUÇÃO

### Funcionalidade

- [ ] Ordens de Serviço funcionando
- [ ] PDF exportando corretamente
- [ ] Contas a Receber com visibilidade
- [ ] Contas a Pagar com visibilidade
- [ ] Fluxo de Caixa mostrando corretamente
- [ ] Comissões rastreadas
- [ ] Dashboard mostrando KPIs
- [ ] Relatórios funcionando
- [ ] Autenticação segura

### Performance

- [ ] Core Web Vitals medidos
- [ ] Queries otimizadas
- [ ] Sem N+1 queries
- [ ] Cache implementado para dados estáticos
- [ ] Imagens comprimidas
- [ ] Lazy loading ativo

### Segurança

- [ ] HTTPS forçado
- [ ] CSRF protection ativo
- [ ] Rate limiting em endpoints
- [ ] Validação de entrada
- [ ] Sanitização de saída
- [ ] Senhas hasheadas
- [ ] Sessões com expiração
- [ ] Audit log funcionando

### Backup & DR

- [ ] Backup automático configurado
- [ ] Retenção de 30 dias
- [ ] Teste de restauração
- [ ] Plano de recovery documentado
- [ ] RTO: 4 horas
- [ ] RPO: 24 horas

### Documentação

- [ ] Manual de usuário
- [ ] Guia de admin
- [ ] Runbook de operação
- [ ] Contato de suporte
- [ ] Hotline 24/7

---

## ESTIMATIVA FINAL

| Fase | Horas | Dias | Status |
|------|-------|------|--------|
| Implementação crítica | 18 | 2-3 | 🔴 PRECISA FAZER |
| Testes | 8 | 1 | 🟡 AGENDADO |
| Deploy staging | 4 | 0.5 | 🟡 AGENDADO |
| Correções | 8 | 1 | 🟡 AGENDADO |
| Go Live | 4 | 0.5 | ✅ PRONTO |
| **TOTAL** | **42** | **5-7** | |

---

## ALTERNATIVAS SE APERTAR TEMPO

### Opção A: MVP (70% funcionalidade) - 1 semana

Ir para produção com:
- ✅ Autenticação
- ✅ Clientes
- ✅ Fornecedores
- ✅ Orçamentos
- ✅ Financeiro (básico)
- ✅ Dashboard

Deixar para depois:
- ❌ Ordens de Serviço
- ❌ Contas a Receber específica
- ❌ Contas a Pagar específica
- ❌ Fluxo de Caixa dashboard
- ❌ Comissões

**Impacto**: 30% da funcionalidade fica para Sprint 2

### Opção B: Versão Completa (90% funcionalidade) - 2 semanas

Implementar tudo:
- ✅ Todos os 20 módulos
- ✅ PDF export
- ✅ Segurança
- ✅ Performance

**Impacto**: Entregas garantidas no prazo

**RECOMENDAÇÃO: OPÇÃO B (GO LIVE COMPLETO)**

---

## MÉTRICAS DE SUCESSO

### Go Live Day

- ✅ Sistema em pé 24/7
- ✅ Menos de 3 bugs críticos reportados
- ✅ Uptime > 99%
- ✅ Tempo de resposta < 500ms

### Primeira Semana

- ✅ 0 data loss incidents
- ✅ Menos de 10 bugs reportados
- ✅ Team Aleeds consegue usar 100% dos workflows

### Primeira Mês

- ✅ Sistema substituiu 100% dos processos manuais
- ✅ Economia de 10+ horas/semana do time
- ✅ Satisfação do usuário > 90%

---

## CONTATO & SUPORTE

**Durante Implementação**: Daily standup (30 min)
**Durante Testes**: Suporte contínuo 9-18h
**Pós Go Live**: On-call 24/7 por 1 mês

---

**REVISÃO FINAL**: Este plano é viável e recomendado.  
**DATA**: Agosto 2026  
**PRONTO PARA COMEÇAR**: ✅ SIM

