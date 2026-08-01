# GO LIVE 1B - Ordem de Serviço (Funcionalidades Avançadas)

## Status de 1A: COMPLETO ✅
Todas as 7 fases de GO LIVE 1A foram finalizadas:
- ✅ Database (6 modelos)
- ✅ Services (11 métodos)
- ✅ Server Actions (22 actions)
- ✅ Componentes (8 componentes)
- ✅ Páginas (4 páginas)
- ✅ Integração Quote→OS
- ✅ Dashboard com KPIs (5 + 6 endpoints)

## Escopo de GO LIVE 1B

### 🎯 Novas Funcionalidades

#### 1. Aba Materiais (Material Management)
- Listagem de materiais necessários
- Cálculo automático baseado em produtos
- Rastreamento de consumo
- Integração com estoque
- Status: recebido/pendente/parcial

#### 2. Aba Comissão (Commission Tab)
- Cálculo automático de comissão por vendedor
- Porcentagem configurável por vendedor
- Histórico de alterações
- Geração de relatórios de comissão
- Integração com folha de pagamento

#### 3. Aba Anexos (Advanced Attachments)
- Upload múltiplo de documentos
- Categorização (fotos, desenhos, PDFs, etc)
- Visualização em preview
- Versionamento de arquivos
- Limite de tamanho e tipos

#### 4. Checklist Avançado
- Checklist dinâmico por etapa
- Marcação de conclusão
- Fotos obrigatórias para cada item
- Assinatura digital
- Histórico de checklists

#### 5. Barra de Progresso Visual
- Progresso geral da OS (%)
- Progresso por etapa (produção, instalação)
- Indicadores de atraso
- Tempo estimado vs real
- ETA em tempo real

#### 6. Cards com Métricas
- Cards na página de detalhes
- Resumo de progresso
- Próximas ações
- Alertas e notificações
- Status atual

#### 7. Timeline Rica
- Timeline visual com eventos
- Filtros por tipo (status, comentário, anexo)
- Busca em timeline
- Zoom temporal (dia/semana/mês)
- Integração com dados de progresso

#### 8. Dashboard Avançado
- KPIs expandidos (20+)
- Gráficos avançados (heatmap, scatter, etc)
- Relatórios customizáveis
- Exportação de dados
- Filtros avançados

#### 9. Kanban da Produção
- Visualização Kanban (To Do → In Progress → Done)
- Drag & drop entre colunas
- Agrupamento por etapa/responsável
- Filtros e busca
- Atualizações em tempo real

#### 10. Gantt Chart
- Timeline visual de produção
- Dependências entre etapas
- Caminho crítico
- Slacks e delays
- Zoom temporal (dias/semanas/meses)

#### 11. Exportação PDF
- Relatório completo em PDF
- Customização de conteúdo
- Assinatura digital
- Rodapé/cabeçalho personalizados
- Qualidade de imagem

#### 12. Integração WhatsApp
- Envio de atualizações para cliente
- Notificações de progresso
- Confirmação de entrega
- Feedback automático
- Logging de mensagens

## Fases de Implementação

### Fase 1: Banco de Dados Expansão (1.5h)
- [ ] Modelo Material (novo)
- [ ] Modelo Commission (novo)
- [ ] Expansão em OSAttachment
- [ ] Expansion em OSComment (tipo timeline)
- [ ] Indices para performance
- [ ] Migrations

### Fase 2: Componentes Avançados (3h)
- [ ] OsMaterialsTab (novo)
- [ ] OsCommissionTab (novo)
- [ ] OsAttachmentsAdvanced (expansão)
- [ ] OsChecklistComponent (novo)
- [ ] OsProgressBar (novo)
- [ ] OsMetricsCards (novo)
- [ ] OsTimelineAdvanced (expansão)
- [ ] OsKanban (novo)
- [ ] OsGanttChart (novo)

### Fase 3: Services & Utilities (2h)
- [ ] MaterialService (novo)
- [ ] CommissionService (novo)
- [ ] ChecklistService (novo)
- [ ] GanttService (novo)
- [ ] PDFExportService (novo)
- [ ] WhatsAppService (novo)
- [ ] Schemas Zod para novos dados

### Fase 4: Server Actions Avançadas (1.5h)
- [ ] Material CRUD
- [ ] Commission calculations
- [ ] Checklist management
- [ ] Attachment versioning
- [ ] PDF generation
- [ ] WhatsApp integration

### Fase 5: Página de Detalhes Expandida (1.5h)
- [ ] Adicionar novas abas (Materiais, Comissão, Checklist)
- [ ] Integração com novos componentes
- [ ] Responsividade
- [ ] Melhorias visuais

### Fase 6: Dashboard Avançado (2h)
- [ ] 20+ novos KPIs
- [ ] Gráficos avançados
- [ ] Filtros customizáveis
- [ ] Relatórios
- [ ] Export CSV/Excel

### Fase 7: Kanban & Gantt (2h)
- [ ] OsKanban interativo
- [ ] OsGantt chart
- [ ] Drag & drop
- [ ] Sincronização

### Fase 8: Integrações Externas (2h)
- [ ] PDF export
- [ ] WhatsApp integration
- [ ] Validações
- [ ] Error handling

### Fase 9: Melhorias Visuais & UX (1.5h)
- [ ] Design refinements
- [ ] Animations
- [ ] Loading states
- [ ] Error handling
- [ ] Responsividade completa

**Total Estimado: 17 horas**

## Arquivos a Criar

### Database
- `prisma/schema.prisma` (modificar - adicionar 2 modelos)

### Services (src/lib/services/)
- `os-materials-service.ts` (novo)
- `os-commission-service.ts` (novo)
- `os-checklist-service.ts` (novo)
- `os-gantt-service.ts` (novo)
- `os-pdf-service.ts` (novo)
- `os-whatsapp-service.ts` (novo)
- `os-dashboard-advanced-service.ts` (novo)

### Schemas (src/lib/schemas/)
- `os-materials.ts` (novo)
- `os-commission.ts` (novo)
- `os-checklist.ts` (novo)

### Components (components/os/)
- `os-materials-tab.tsx` (novo)
- `os-commission-tab.tsx` (novo)
- `os-attachments-advanced.tsx` (modificar)
- `os-checklist.tsx` (novo)
- `os-progress-bar.tsx` (novo)
- `os-metrics-cards.tsx` (novo)
- `os-timeline-advanced.tsx` (modificar)
- `os-kanban.tsx` (novo)
- `os-gantt-chart.tsx` (novo)

### Server Actions (app/actions/)
- `os-materials.ts` (novo)
- `os-commission.ts` (novo)
- `os-checklist.ts` (novo)
- `os-export.ts` (novo)
- `os-whatsapp.ts` (novo)

### Pages (app/(app)/os/)
- `[id]/page.tsx` (modificar - adicionar novas abas)
- `dashboard/advanced/page.tsx` (novo)

### API Routes (app/api/os/)
- `export/pdf/route.ts` (novo)
- `whatsapp/send/route.ts` (novo)
- `materials/auto-calculate/route.ts` (novo)

## Priorização

### MVP 1B (Essencial)
- ✅ Aba Materiais
- ✅ Aba Comissão
- ✅ Upload Avançado
- ✅ Barra de Progresso
- ✅ Cards com métricas
- ✅ Dashboard avançado

### V2 (Nice to have)
- 🟡 Checklist avançado
- 🟡 Timeline rica
- 🟡 Kanban
- 🟡 Gantt
- 🟡 PDF export
- 🟡 WhatsApp integration

## Dependências Novas Necessárias

```json
{
  "pdf-lib": "^1.17.1",
  "pdfkit": "^0.13.0",
  "react-grid-layout": "^1.3.5",
  "recharts": "^2.10.0",
  "react-dnd": "^16.0.1",
  "react-beautiful-dnd": "^13.1.1",
  "html2pdf": "^0.10.1"
}
```

## Indicadores de Sucesso

- ✅ Todas as novas abas funcionando
- ✅ Novo dashboard com 20+ KPIs
- ✅ Kanban e Gantt interativos
- ✅ PDF export funcionando
- ✅ WhatsApp integrado
- ✅ Performance otimizada
- ✅ Zero regressões em 1A
- ✅ Documentação completa

## Timeline Recomendado

**Total: 2-3 dias** (17 horas = 2 dias full-time ou 3 dias part-time)

- Dia 1 (8h): Fases 1-3 (Database, Components Básicos, Services)
- Dia 2 (6h): Fases 4-6 (Actions, Pages, Dashboard Avançado)
- Dia 3 (3h): Fases 7-9 (Kanban, Gantt, Integrações, Visuais)

## Riscos

1. **Performance com muitos dados** → Paginação, virtualization
2. **Complexidade do Gantt** → Usar library pronta (react-gantt-chart)
3. **Integração WhatsApp** → Usar API Twilio ou similar
4. **PDF export complexo** → Usar html2pdf ou pdfkit

## Rollback Plan

- Manter 1A funcional 100%
- Feature flags para 1B
- Commits incremental a cada fase
- Testes E2E entre fases

---

**Status**: Pronto para implementação
**Documentação**: 1B_SPECIFIC_GUIDES/ (será criada conforme avançamos)
