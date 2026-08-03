# GO LIVE 4 — CONTAS A RECEBER (ACCOUNTS RECEIVABLE)

## Objetivo
Implementar módulo completo de Contas a Receber, totalmente integrado com Clientes, Orçamentos, Ordens de Serviço e Dashboard Financeiro.

## Arquitetura

### Modelos Prisma a Criar
1. **AccountsReceivable** - Conta principal
2. **ReceivableInstallment** - Parcelas da conta
3. **ReceivablePayment** - Recebimentos registrados
4. **ReceivableHistory** - Auditoria e histórico

### Integrações Existentes
- Client (cliente da conta)
- Quote (orçamento de origem)
- ServiceOrder (OS de origem)
- CashMovement (fluxo de caixa)
- FinancialAccount (conta bancária)
- Employee (vendedor)

## Fases de Implementação

### Fase 1: Estrutura Financeira
- 4 novos modelos Prisma
- Enums para status e tipos
- Índices de performance
- Relações com modelos existentes

### Fase 2: CRUD de Contas
- Create (manual + automático)
- Read (listagem + detalhes)
- Update (editar dados)
- Delete (cancelar)
- Server Actions completas

### Fase 3: Parcelamento
- Suporte a pagamento à vista
- Parcelado
- Entrada + parcelas
- Cada parcela com vencimento e status

### Fase 4: Recebimentos
- Registrar pagamento
- Atualizar fluxo de caixa automaticamente
- Estornar pagamento
- Histórico completo

### Fase 5: Tela Principal
- 6 cards de resumo
- Tabela com 8+ colunas
- Filtros avançados
- Paginação e ordenação

### Fase 6: Dashboard
- 6 KPIs principais
- 5 gráficos (Recharts)
- Comparativos históricos
- Análises de inadimplência

### Fase 7: Alertas
- Contas vencidas
- Vencendo hoje
- Vencendo em 3 dias
- Recebimento parcial
- Cliente inadimplente

### Fase 8: Integrações Automáticas
- Criar contas ao gerar OS
- Criar ao aprovar orçamento
- Atualizar caixa ao receber
- Sincronizar dashboards

## Critérios de Aceite
✅ CRUD completo
✅ Geração automática
✅ Parcelas com recebimento parcial
✅ Atualização automática de caixa
✅ Dashboard atualizado em tempo real
✅ Alertas de vencimentos
✅ Histórico completo
✅ Interface responsiva
✅ TypeScript strict
✅ Pronto para produção

## Estimativa
- Fase 1: 1.5h
- Fase 2: 2h
- Fase 3: 1.5h
- Fase 4: 1.5h
- Fase 5: 2h
- Fase 6: 2.5h
- Fase 7: 1h
- Fase 8: 2h

**Total: ~14 horas**
