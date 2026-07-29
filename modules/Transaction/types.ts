export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CHECK' | 'TRANSFER' | 'CREDIT_CARD' | 'PIX'

export interface Transaction {
  id: string
  companyId: string
  type: TransactionType
  amount: number
  description: string
  status: TransactionStatus
  paymentMethod: PaymentMethod
  dueDate: Date
  paymentDate: Date | null
  notes: string | null
  clientId: string | null
  projectId: string | null
  salespersonId: string | null
  supplierId: string | null
  expenseCategoryId: string | null
  incomeCategoryId: string | null
  costCenterId: string | null
  bankAccountId: string | null
  category: string | null
  createdAt: Date
  updatedAt: Date
}

export type TransactionWithRelations = Transaction & {
  client?: { id: string; name: string } | null
  project?: { id: string; name: string } | null
  salesperson?: { id: string; name: string } | null
  supplier?: { id: string; name: string } | null
  expenseCategory?: { id: string; name: string } | null
  incomeCategory?: { id: string; name: string } | null
  costCenter?: { id: string; name: string } | null
  bankAccount?: { id: string; name: string } | null
}

export interface FilterOptions {
  status?: TransactionStatus
  type?: TransactionType
  startDate?: Date
  endDate?: Date
  clientId?: string
  projectId?: string
  salespersonId?: string
  supplierId?: string
  expenseCategoryId?: string
  incomeCategoryId?: string
  costCenterId?: string
  bankAccountId?: string
  paymentMethod?: PaymentMethod
}

export interface TransactionStats {
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
  overdueIncome: number
  overdueExpense: number
}
