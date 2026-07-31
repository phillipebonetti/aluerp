/**
 * Tipos de Financeiro
 * Consolidação centralizada de tipos relacionados a gestão financeira
 */

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type TransactionCategory = 'SALES' | 'SERVICES' | 'INTEREST' | 'SUPPLIES' | 'PAYROLL' | 'UTILITIES' | 'RENT' | 'EQUIPMENT' | 'OTHER'
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER' | 'PISCIX' | 'OTHER'

export interface Account {
  id: string
  companyId: string
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT'
  bank?: string
  accountNumber?: string
  balance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  companyId: string
  accountId: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  paymentMethod?: PaymentMethod
  status: TransactionStatus
  date: Date
  dueDate?: Date
  paidDate?: Date
  referenceNumber?: string
  notes?: string
  attachments?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface Invoice {
  id: string
  companyId: string
  type: 'SENT' | 'RECEIVED'
  number: string
  clientId?: string
  supplierId?: string
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  subtotal: number
  discount: number
  tax: number
  total: number
  status: 'DRAFT' | 'SENT' | 'OVERDUE' | 'PAID' | 'CANCELLED'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface RecurringTransaction {
  id: string
  companyId: string
  name: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  startDate: Date
  endDate?: Date
  accountId: string
  isActive: boolean
  createdAt: Date
}

export interface BankReconciliation {
  id: string
  companyId: string
  accountId: string
  statementDate: Date
  openingBalance: number
  closingBalance: number
  deposits: number
  withdrawals: number
  reconciliationDate?: Date
  status: 'PENDING' | 'RECONCILED' | 'DISCREPANCY'
  notes?: string
}

export interface CreateTransactionPayload {
  accountId: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  paymentMethod?: PaymentMethod
  date: Date
  dueDate?: Date
  referenceNumber?: string
  notes?: string
}

export interface UpdateTransactionPayload {
  description?: string
  amount?: number
  category?: TransactionCategory
  status?: TransactionStatus
  dueDate?: Date
  paidDate?: Date
  notes?: string
}

export interface TransactionFilters {
  accountId?: string
  type?: TransactionType
  category?: TransactionCategory
  status?: TransactionStatus
  paymentMethod?: PaymentMethod
  createdAfter?: Date
  createdBefore?: Date
  minAmount?: number
  maxAmount?: number
  search?: string
}

export interface FinancialStats {
  totalIncome: number
  totalExpense: number
  netIncome: number
  cashBalance: number
  accountsReceivable: number
  accountsPayable: number
  byCategory: Record<TransactionCategory, number>
  monthlyIncome: Record<string, number>
  monthlyExpense: Record<string, number>
}

export interface CashFlowData {
  date: Date
  income: number
  expense: number
  balance: number
}

export interface FinancialReport {
  period: {
    start: Date
    end: Date
  }
  summary: FinancialStats
  cashFlow: CashFlowData[]
  receivables: {
    total: number
    overdue: number
    due: number
  }
  payables: {
    total: number
    overdue: number
    due: number
  }
  topExpenseCategories: {
    category: TransactionCategory
    amount: number
  }[]
}

export interface BudgetComparison {
  category: TransactionCategory
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  status: 'UNDER' | 'ON_TRACK' | 'OVER'
}
