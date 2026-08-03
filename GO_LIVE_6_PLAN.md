# GO LIVE 6 — CONTAS A RECEBER + COMISSÕES (MVP)

## Objetivo
Construir o módulo completo de Contas a Receber totalmente integrado ao ERP, com automações de comissões, geração de parcelas e dashboard executivo.

## Stack Base (Reutilizado)
- Models: AccountsReceivable, ReceivableInstallment, ReceivablePayment, ReceivableHistory, CommissionPayment, CommissionHistory
- Services: accounts-receivable-service, commission-calculation-service
- Pages: /financeiro/contas-a-receber

## Fases de Implementação

### Fase 1: Integração Quote → Receivable (Automação)
- Hook ao aprovar orçamento
- Gerar contas e parcelas automaticamente
- Opções: 1 conta ou múltiplas parcelas

### Fase 2: Integração ServiceOrder → Commission
- Ao gerar OS, calcular comissão
- Registrar em CommissionPayment (status PENDENTE)
- Vincular ao vendedor

### Fase 3: Detalhes e Parcelas
- Página `/contas-a-receber/[id]` com abas
- Lista de parcelas com status
- Histórico de movimentações

### Fase 4: Recebimentos Integrados
- Registrar recebimento de parcela
- Atualizar CashMovement automaticamente
- Gerar comissão quando confirmado

### Fase 5: Dashboard Avançado
- 6 cards (Total, Recebido, Atrasado, Hoje, Semana, Comissões)
- 4 gráficos (Recebimentos, Inadimplência, Receitas, Top clientes)
- Filtros por período

### Fase 6: Validações e Permissões
- Validações Zod completas
- Permissões granulares (Admin, Financeiro, Vendedor)
- Restrições de acesso

### Fase 7: Server Actions Completos
- CRUD, Baixar parcela, Cancelar, Reabrir
- Gerar parcelas, Pagar comissão
- Dashboard + Relatórios

## Validações

- Não permitir valores negativos
- Não permitir duplicidade
- Parcelas inconsistentes
- Datas inválidas
- Cliente inexistente

## Permissões

- Administrador: Acesso total
- Financeiro: CRUD, recebimentos
- Vendedor: Visualizar próprias vendas e comissões

## Resultado Esperado

Módulo totalmente funcional, pronto para produção, mantendo padrão visual e arquitetural existente.
