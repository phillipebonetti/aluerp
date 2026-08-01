# SPRINT GO LIVE 3 — Fluxo de Caixa e Dashboard Financeiro

## Visão Geral

Implementação completa de um módulo de Fluxo de Caixa integrado com toda a arquitetura do AluERP, permitindo visualização em tempo real, previsões, KPIs e alertas financeiros.

## Arquitetura Geral

### Modelos Prisma a Criar (Fase 1)

1. **CashMovement** - Movimentação de caixa (entrada/saída/transferência)
   - Tipo (ENTRADA, SAIDA, TRANSFERENCIA, AJUSTE)
   - Categoria
   - Centro de custo
   - Conta financeira
   - Origem (OS, ORCAMENTO, COMISSAO, MANUAL)
   - Status (PREVISTA, CONFIRMADA, CANCELADA)

2. **FinancialAccount** - Contas bancárias/financeiras
   - Tipo (CONTA_CORRENTE, CONTA_POUPANCA, CAIXA)
   - Saldo inicial
   - Saldo atual
   - Ativa/Inativa

3. **CostCenter** - Centros de custo
   - Nome
   - Descrição
   - Percentual alocação

4. **ExpenseCategory** - Categorias de despesa
   - Nome (Aluguel, Folha, Impostos, etc)
   - Tipo (FIXA, VARIAVEL)

5. **FinancialForecast** - Previsão de caixa
   - Data de previsão
   - Saldo estimado
   - Entradas estimadas
   - Saídas estimadas

### Integrações Automáticas (Fase 5)

- **ServiceOrder** → CashMovement (receita prevista)
- **CommissionPayment** → CashMovement (despesa)
- **Quote** → CashMovement (recebimento futuro)
- **PurchaseRequest** → CashMovement (pagamento futuro)

## Fases de Implementação

### Fase 1: Estrutura Financeira (2h)
- 5 novos modelos Prisma
- Enums para tipos de movimento
- Tipos TypeScript
- Schemas Zod

### Fase 2: Fluxo de Caixa (3h)
- Tela principal com cards
- Tabela de movimentações
- Filtros avançados
- Paginação e ordenação

### Fase 3: Previsão (2h)
- Cálculo automático 7/15/30/60/90 dias
- Gráfico de projeção
- Service de cálculo

### Fase 4: Dashboard (3h)
- 8 KPIs principais
- 6 gráficos interativos
- Comparativos

### Fase 5: Integrações (2.5h)
- Triggers automáticos
- Atualização de saldos
- Reconciliação

### Fase 6: Conciliação (1.5h)
- Marcação de status
- Histórico de alterações
- Auditoria

### Fase 7: Alertas (1.5h)
- Alertas automáticos
- Notificações
- Widget de alertas

## Tecnologias

- Prisma ORM (novos modelos)
- React Hook Form + Zod
- shadcn/ui (components)
- Recharts (gráficos)
- Server Actions (operações)
- TypeScript strict

## Estimativa Total: 15-18 horas
