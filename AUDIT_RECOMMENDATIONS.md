# Recomendações Técnicas Detalhadas - AluERP

## PARTE 1: PADRÕES DE DADOS

### 1.1 Repository Pattern

#### Implementação:

```typescript
// lib/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  protected prisma = await getPrisma()
  
  async findById(id: string, companyId: string): Promise<T | null> {
    return this.prisma[this.entity].findFirst({
      where: { id, companyId, deletedAt: null }
    })
  }
  
  async findAll(companyId: string): Promise<T[]> {
    return this.prisma[this.entity].findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  async create(companyId: string, data: any): Promise<T> {
    return this.prisma[this.entity].create({
      data: { ...data, companyId }
    })
  }
  
  async update(id: string, companyId: string, data: any): Promise<T> {
    return this.prisma[this.entity].update({
      where: { id, companyId },
      data
    })
  }
  
  async softDelete(id: string, companyId: string): Promise<T> {
    return this.prisma[this.entity].update({
      where: { id, companyId },
      data: { deletedAt: new Date() }
    })
  }
}

// lib/repositories/transaction.repository.ts
export class TransactionRepository extends BaseRepository<Transaction> {
  entity = 'transaction'
  
  async findByStatus(companyId: string, status: TransactionStatus): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { companyId, status, deletedAt: null },
      include: { client: true, project: true }
    })
  }
  
  async findByDateRange(
    companyId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        companyId,
        dueDate: { gte: startDate, lte: endDate },
        deletedAt: null
      }
    })
  }
}
```

#### Benefícios:
- Queries reutilizáveis
- Testável em isolamento
- Fácil trocar de BD
- Sem duplicação

---

### 1.2 Service Layer

```typescript
// lib/services/transaction.service.ts
export class TransactionService {
  private repository = new TransactionRepository()
  
  async createTransaction(companyId: string, input: CreateTransactionInput) {
    // Validação de negócio
    if (input.type === 'EXPENSE') {
      await this.validateBankAccountBalance(companyId, input)
    }
    
    // Criação
    const transaction = await this.repository.create(companyId, input)
    
    // Auditoria
    await this.logTransaction('CREATE', transaction)
    
    return transaction
  }
  
  async calculateCashFlow(companyId: string, period: DateRange) {
    const transactions = await this.repository.findByDateRange(
      companyId,
      period.start,
      period.end
    )
    
    return {
      income: transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0),
      expense: transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
    }
  }
  
  private async validateBankAccountBalance(companyId: string, input: CreateTransactionInput) {
    if (!input.bankAccountId) return
    
    const bankAccount = await this.bankAccountRepo.findById(
      input.bankAccountId,
      companyId
    )
    
    if (bankAccount.balance < input.amount) {
      throw new InsufficientFundsError()
    }
  }
  
  private async logTransaction(action: string, transaction: Transaction) {
    // Auditoria
  }
}
```

#### Benefícios:
- Lógica fora dos componentes
- Reutilizável em múltiplos places
- Testável
- Auditoria centralizada

---

## PARTE 2: COMPONENTIZAÇÃO

### 2.1 GenericCRUDList

```typescript
// components/generic/generic-crud-list.tsx
interface CRUDListProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  loading: boolean
  onCreate: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  renderForm: (item?: T, onClose: () => void) => React.ReactNode
}

export function GenericCRUDList<T extends { id: string }>({
  title,
  columns,
  data,
  loading,
  onCreate,
  onEdit,
  onDelete,
  renderForm
}: CRUDListProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>{title}</h1>
        <Button onClick={() => {
          setSelected(null)
          setIsOpen(true)
          onCreate()
        }}>
          Nova {title}
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={(row) => {
          setSelected(row)
          setIsOpen(true)
          onEdit(row)
        }}
      />
      
      {isOpen && renderForm(selected, () => setIsOpen(false))}
    </div>
  )
}

// Usage:
<GenericCRUDList<ExpenseCategory>
  title="Categorias de Despesa"
  columns={expenseColumns}
  data={categories}
  loading={loading}
  onCreate={handleCreate}
  onEdit={handleEdit}
  onDelete={handleDelete}
  renderForm={(item, onClose) => (
    <CategoryForm item={item} onClose={onClose} />
  )}
/>
```

### 2.2 Remover Duplicação

```typescript
// ❌ ANTES: Dois componentes quase idênticos
// components/financial/expense-category-list.tsx (121 linhas)
// components/financial/income-category-list.tsx (115 linhas)

// ✅ DEPOIS: Um componente genérico
// components/financial/category-list.tsx
export function CategoryList({ type }: { type: 'EXPENSE' | 'INCOME' }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const data = type === 'EXPENSE'
        ? await FinancialCategoryActions.getExpenseCategories()
        : await FinancialCategoryActions.getIncomeCategories()
      setCategories(data)
      setLoading(false)
    }
    
    fetch()
  }, [type])
  
  return (
    <GenericCRUDList
      title={`Categorias de ${type === 'EXPENSE' ? 'Despesa' : 'Receita'}`}
      columns={[...]}
      data={categories}
      loading={loading}
      onCreate={() => { }}
      onEdit={(cat) => { }}
      onDelete={async (cat) => {
        await FinancialCategoryActions.deleteCategory(cat.id, type)
      }}
      renderForm={(item, onClose) => (
        <CategoryForm
          category={item}
          type={type}
          onClose={onClose}
        />
      )}
    />
  )
}
```

---

## PARTE 3: GERENCIAMENTO DE ESTADO

### 3.1 Substituir Props Drilling com Zustand

```typescript
// lib/store/transaction.store.ts
import { create } from 'zustand'

interface TransactionStore {
  // State
  transactions: Transaction[]
  loading: boolean
  error: string | null
  selectedTransaction: Transaction | null
  filters: FilterOptions
  
  // Actions
  setTransactions: (transactions: Transaction[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedTransaction: (transaction: Transaction | null) => void
  setFilters: (filters: FilterOptions) => void
  
  // Async actions
  fetchTransactions: (companyId: string) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loading: false,
  error: null,
  selectedTransaction: null,
  filters: {},
  
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  setFilters: (filters) => set({ filters }),
  
  fetchTransactions: async (companyId: string) => {
    set({ loading: true })
    try {
      const result = await TransactionActions.getTransactions()
      set({ transactions: result.data || [], error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  
  deleteTransaction: async (id: string) => {
    set({ loading: true })
    try {
      await TransactionActions.deleteTransaction(id)
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }))
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  }
}))

// Usage em componentes:
export function TransactionList() {
  const { transactions, loading, fetchTransactions } = useTransactionStore()
  
  useEffect(() => {
    fetchTransactions(companyId)
  }, [])
  
  return <DataTable data={transactions} loading={loading} />
}
```

---

## PARTE 4: VALIDAÇÃO COM REACT HOOK FORM

```typescript
// lib/hooks/useFormWithZod.ts
import { useForm, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'

export function useFormWithZod<T>(
  schema: ZodSchema,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  return useForm<T>({
    resolver: zodResolver(schema),
    ...options
  })
}

// components/forms/category-form.tsx
export function CategoryForm({ category, type, onClose }: CategoryFormProps) {
  const form = useFormWithZod(CreateCategorySchema, {
    defaultValues: category || {}
  })
  
  async function onSubmit(data: CreateCategoryInput) {
    try {
      if (category) {
        await FinancialCategoryActions.updateCategory(category.id, data, type)
      } else {
        await FinancialCategoryActions.createCategory(data, type)
      }
      onClose()
    } catch (error) {
      form.setError('root', { message: error.message })
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <Input {...field} placeholder="Nome da categoria" />
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <Input {...field} placeholder="Descrição" />
        )}
      />
      
      <button type="submit" disabled={form.formState.isSubmitting}>
        {category ? 'Atualizar' : 'Criar'}
      </button>
    </form>
  )
}
```

---

## PARTE 5: CACHE E PERFORMANCE

### 5.1 SWR (Stale-While-Revalidate)

```typescript
// lib/hooks/useTransactions.ts
import useSWR from 'swr'
import { TransactionActions } from '@/modules/Transaction'

export function useTransactions(filters?: FilterOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    ['transactions', filters],
    async () => {
      const result = await TransactionActions.getTransactions(filters)
      return result.data || []
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
      focusThrottleInterval: 300000 // 5 minutos
    }
  )
  
  return {
    transactions: data || [],
    isLoading,
    error,
    mutate // Para revalidar manualmente
  }
}

// Uso:
export function TransactionList() {
  const { transactions, isLoading, mutate } = useTransactions()
  
  const handleDelete = async (id: string) => {
    await TransactionActions.deleteTransaction(id)
    mutate() // Revalidar após delete
  }
}
```

### 5.2 Memoização

```typescript
// components/transaction/transaction-row.tsx
const TransactionRow = React.memo(function TransactionRow({
  transaction,
  onEdit,
  onDelete
}: TransactionRowProps) {
  const handleEdit = useCallback(() => {
    onEdit(transaction)
  }, [transaction, onEdit])
  
  return (
    <tr>
      <td>{new Date(transaction.dueDate).toLocaleDateString()}</td>
      <td>{transaction.description}</td>
      <td>
        <Badge>{transaction.status}</Badge>
      </td>
      <td>R$ {transaction.amount.toFixed(2)}</td>
      <td>
        <button onClick={handleEdit}>Editar</button>
        <button onClick={() => onDelete(transaction.id)}>Deletar</button>
      </td>
    </tr>
  )
})
```

---

## PARTE 6: TESTES

```typescript
// __tests__/repositories/transaction.repository.test.ts
import { TransactionRepository } from '@/lib/repositories'

describe('TransactionRepository', () => {
  let repo: TransactionRepository
  
  beforeEach(() => {
    repo = new TransactionRepository()
  })
  
  it('should find transactions by company id', async () => {
    const transactions = await repo.findAll('company-123')
    
    expect(transactions).toBeDefined()
    expect(transactions.every(t => t.companyId === 'company-123')).toBe(true)
  })
  
  it('should not return deleted transactions', async () => {
    const transactions = await repo.findAll('company-123')
    
    expect(transactions.every(t => t.deletedAt === null)).toBe(true)
  })
})

// __tests__/services/transaction.service.test.ts
import { TransactionService } from '@/lib/services'

describe('TransactionService', () => {
  let service: TransactionService
  
  beforeEach(() => {
    service = new TransactionService()
  })
  
  it('should validate insufficient funds', async () => {
    const input = {
      type: 'EXPENSE',
      amount: 10000,
      bankAccountId: 'bank-123'
    }
    
    await expect(
      service.validateBankAccountBalance('company-123', input)
    ).rejects.toThrow('InsufficientFundsError')
  })
})
```

---

## PARTE 7: LAZY LOADING

```typescript
// app/(app)/layout.tsx
import dynamic from 'next/dynamic'

const DashboardContent = dynamic(() => import('@/components/dashboard'), {
  loading: () => <LoadingState />
})

const RelatosContent = dynamic(() => import('@/components/relatorios'), {
  loading: () => <LoadingState />
})

// Reduz bundle size significativamente
```

---

## PARTE 8: ERROR HANDLING

```typescript
// lib/errors/index.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super('INSUFFICIENT_FUNDS', 'Saldo insuficiente', 400)
  }
}

// components/error-boundary.tsx
export class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.hasError} />
    }
    
    return this.props.children
  }
}
```

---

## RESUMO: PRÓXIMAS AÇÕES

### Semana 1: Fundação
- [ ] Implementar BaseRepository
- [ ] Criar 6 Repositories específicas
- [ ] Implementar TransactionService como exemplo
- [ ] Refatorar transaction-form.tsx com React Hook Form

### Semana 2: Componentização
- [ ] Criar GenericCRUDList
- [ ] Refatorar ExpenseCategoryList + IncomeCategoryList
- [ ] Remover duplicação
- [ ] Implementar Zustand store

### Semana 3: Performance
- [ ] Adicionar SWR
- [ ] Implementar Memoização
- [ ] Lazy loading de rotas
- [ ] Cache de categorias

### Semana 4: Qualidade
- [ ] Testes unitários (Repositories, Services)
- [ ] Error handling centralizado
- [ ] Logging e monitoring
- [ ] Documentation

