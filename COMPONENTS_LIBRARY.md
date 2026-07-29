# Biblioteca de Componentes AluERP

Documentação completa de todos os componentes reutilizáveis da aplicação.

## Índice

- [Cards](#cards)
- [Formulários](#formulários)
- [Tabelas & Listas](#tabelas--listas)
- [Diálogos & Modais](#diálogos--modais)
- [Busca & Filtros](#busca--filtros)
- [Gráficos & Analytics](#gráficos--analytics)
- [Layout](#layout)
- [Estados](#estados)

---

## Cards

### MoneyCard
Card especializado para valores monetários com formatação automática.

**Props:**
```typescript
{
  title: string              // Título do card
  value: number | string     // Valor numérico
  currency?: 'BRL' | 'USD'   // Moeda (padrão: BRL)
  icon: LucideIcon          // Ícone do lucide
  trend?: number            // Tendência em % (positivo/negativo)
  trendLabel?: string       // Label da tendência
  variant?: 'income' | 'expense' | 'balance' | 'neutral'
  description?: string      // Descrição adicional
}
```

**Exemplo:**
```typescript
<MoneyCard
  title="Receita do Mês"
  value={15000}
  icon={TrendingUp}
  variant="income"
  trend={15}
  trendLabel="vs. mês anterior"
/>
```

### MetricCard
Card para exibir métricas numéricas.

**Exemplo:**
```typescript
<MetricCard
  title="Clientes Ativos"
  value={248}
  icon={Users}
  color="success"
  description="crescimento de 12%"
/>
```

### SectionCard
Container genérico com estrutura header/conteúdo/footer.

**Exemplo:**
```typescript
<SectionCard
  title="Últimas Movimentações"
  description="Últimos 10 registros"
  footer={<Button>Ver mais</Button>}
>
  {/* Conteúdo aqui */}
</SectionCard>
```

---

## Formulários

### FormSection
Agrupa múltiplos inputs com layout responsivo.

**Exemplo:**
```typescript
<FormSection 
  title="Dados Pessoais" 
  description="Preencha os dados do cliente"
  columnLayout={2}  // 1, 2 ou 3
>
  <FormInput label="Nome" required />
  <FormInput label="Email" type="email" />
</FormSection>
```

### FormInput
Input text padronizado com validação.

**Exemplo:**
```typescript
<FormInput
  label="Nome do Projeto"
  placeholder="Digite o nome..."
  error={errors.name ? "Nome é obrigatório" : undefined}
  helper="Máximo 100 caracteres"
  required
  icon={Building2}
/>
```

### FormSelect
Select dropdown com opções tipadas.

**Exemplo:**
```typescript
<FormSelect
  label="Categoria"
  options={[
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' },
  ]}
  placeholder="Selecione..."
  required
/>
```

### FormTextarea
Textarea com contador de caracteres.

**Exemplo:**
```typescript
<FormTextarea
  label="Observações"
  maxLength={500}
  showCount
  helper="Descreva detalhes importantes"
  rows={4}
/>
```

### FormDatePicker
Input date com ícone de calendário.

**Exemplo:**
```typescript
<FormDatePicker
  label="Data de Entrega"
  required
  error={errors.date}
/>
```

---

## Tabelas & Listas

### DataTable
Tabela simples com colunas customizáveis.

**Exemplo:**
```typescript
<DataTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge>{value}</Badge>,
    },
  ]}
  data={clients}
  onRowClick={(row) => router.push(`/clients/${row.id}`)}
/>
```

### DataTableAdvanced
Tabela com paginação integrada.

**Exemplo:**
```typescript
<DataTableAdvanced
  columns={columns}
  data={filteredData}
  currentPage={page}
  pageSize={20}
  totalItems={total}
  onPageChange={setPage}
/>
```

### ListItem
Item de lista com múltiplas variantes e conteúdo customizável.

**Exemplo:**
```typescript
<ListItem
  icon={Users}
  title="João Silva"
  subtitle="Gerente de Projetos"
  description="Responsável por 3 obras ativas"
  value="R$ 125.000"
  badge={<Badge>Ativo</Badge>}
  showArrow
/>
```

### StatGroup
Agrupa múltiplas estatísticas em grid.

**Exemplo:**
```typescript
<StatGroup
  columns={3}
  stats={[
    { label: 'Total de Receita', value: 'R$ 125.000', variant: 'highlight' },
    { label: 'Despesas', value: 'R$ 45.000' },
    { label: 'Lucro Líquido', value: 'R$ 80.000', variant: 'highlight' },
  ]}
/>
```

---

## Diálogos & Modais

### Modal
Modal centrado com overlay.

**Exemplo:**
```typescript
const [open, setOpen] = useState(false)

<Modal
  isOpen={open}
  title="Criar Novo Projeto"
  description="Preencha os dados do projeto"
  onClose={() => setOpen(false)}
  size="lg"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button>Criar</Button>
    </>
  }
>
  {/* Conteúdo do modal */}
</Modal>
```

### Drawer
Drawer lateral (esquerda ou direita).

**Exemplo:**
```typescript
<Drawer
  isOpen={open}
  title="Filtros"
  position="left"
  size="md"
  onClose={() => setOpen(false)}
>
  {/* Conteúdo do drawer */}
</Drawer>
```

### ConfirmDialog
Dialog de confirmação reutilizável.

**Exemplo:**
```typescript
const [showConfirm, setShowConfirm] = useState(false)

<ConfirmDialog
  isOpen={showConfirm}
  title="Deletar cliente?"
  description="Esta ação não pode ser desfeita. O cliente será removido do sistema."
  isDangerous
  confirmText="Deletar"
  onConfirm={async () => {
    await deleteClient(id)
    setShowConfirm(false)
  }}
  onCancel={() => setShowConfirm(false)}
/>
```

---

## Busca & Filtros

### SearchBar
Barra de busca com limpeza automática.

**Exemplo:**
```typescript
const [query, setQuery] = useState('')

<SearchBar
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}
  placeholder="Pesquisar clientes..."
/>
```

### FilterBar
Exibe filtros ativos e permite remover.

**Exemplo:**
```typescript
const [filters, setFilters] = useState([
  { id: 'status-active', label: 'Status: Ativo' },
  { id: 'region-sp', label: 'Região: SP' },
])

<FilterBar
  filters={filters}
  onRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
  onClearAll={() => setFilters([])}
/>
```

---

## Gráficos & Analytics

### DashboardChart
Wrapper para gráficos com estados.

**Exemplo:**
```typescript
<DashboardChart
  title="Receita por Mês"
  description="Últimos 12 meses"
  loading={isLoading}
  error={error}
  footer={<p className="text-xs text-muted-foreground">Atualizado há 5 minutos</p>}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      {/* Gráfico aqui */}
    </LineChart>
  </ResponsiveContainer>
</DashboardChart>
```

---

## Layout

### PageHeader
Header de página com título, descrição e ação.

**Exemplo:**
```typescript
<PageHeader
  title="Clientes"
  description="Gerencie todos os clientes da empresa"
  badge="12 ativos"
  action={{
    label: "Novo Cliente",
    icon: Plus,
    onClick: () => router.push('/clients/new'),
  }}
/>
```

### Button
Botão com múltiplas variantes.

**Variantes:** default, outline, secondary, ghost, destructive, link

**Tamanhos:** xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg

**Exemplo:**
```typescript
<Button variant="default" size="sm">
  <Plus className="w-4 h-4" />
  Adicionar
</Button>
```

---

## Estados

### EmptyState
Estado vazio com ícone e CTA.

**Exemplo:**
```typescript
<EmptyState
  icon={Inbox}
  title="Nenhum cliente encontrado"
  description="Comece criando seu primeiro cliente"
  action={{
    label: "Criar Cliente",
    onClick: () => router.push('/clients/new'),
  }}
/>
```

### Skeleton / LoadingCard
Loaders com animação pulse.

**Exemplo:**
```typescript
{isLoading ? (
  <LoadingCard lines={4} height="lg" />
) : (
  <SectionCard title="Dados">
    {/* Conteúdo */}
  </SectionCard>
)}
```

---

## Boas Práticas

### 1. Use o Index para Importação
```typescript
// ✅ Certo
import { MoneyCard, FormInput, DataTable } from '@/components/ui'

// ❌ Evitar
import { MoneyCard } from '@/components/ui/money-card'
import { FormInput } from '@/components/ui/form-input'
```

### 2. TypeScript First
Todos os componentes são totalmente tipados. Use IntelliSense!

```typescript
// O TypeScript vai alertar se faltar props obrigatórias
<MoneyCard title="..." value={...} icon={...} />
```

### 3. Responsive Design
Componentes já são mobile-first. Use `columnLayout` ou `size` para ajustar.

```typescript
<FormSection columnLayout={2} />  // 1 coluna mobile, 2 desktop
```

### 4. Reutilize Sempre
Antes de criar um novo componente, veja se já existe na biblioteca.

### 5. Validação de Formulários
Use `error` para mostrar erros de validação.

```typescript
<FormInput
  label="Email"
  error={errors.email ? "Email inválido" : undefined}
/>
```

---

## Próximas Adições

- [ ] AutoComplete com suggestions
- [ ] DateRanePicker para filtros
- [ ] Tree view para hierarquias
- [ ] Kanban board para tarefas
- [ ] Gantt chart para cronograma
- [ ] File upload dropzone

---

**Última atualização:** Sprint 3 - 29/07/2025
