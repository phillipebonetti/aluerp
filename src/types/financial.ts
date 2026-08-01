export type CashMovementType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE'
export type CashMovementStatus = 'PREVISTA' | 'CONFIRMADA' | 'CANCELADA'
export type FinancialAccountType = 'CONTA_CORRENTE' | 'CONTA_POUPANCA' | 'CAIXA'
export type ExpenseCategoryType = 'FIXA' | 'VARIAVEL'
export type SourceType = 'OS' | 'ORCAMENTO' | 'COMISSAO' | 'MANUAL' | 'PAGAMENTO' | 'RECEBIMENTO'
export type AlertType = 'VENCIDO' | 'VENCENDO_HOJE' | 'CAIXA_NEGATIVO' | 'RECEBIMENTO_ATRASADO' | 'PAGAMENTO_ATRASADO'
export type AlertSeverity = 'INFO' | 'WARNING' | 'DANGER'

export interface FinancialAccount {
  id: string
  companyId: string
  name: string
  type: FinancialAccountType
  bankName?: string
  accountNumber?: string
  branch?: string
  balance: number
  initialBalance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseCategory {
  id: string
  companyId: string
  name: string
  type: ExpenseCategoryType
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CostCenter {
  id: string
  companyId: string
  name: string
  description?: string
  allocationPercentage: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CashMovement {
  id: string
  companyId: string
  accountId: string
  categoryId?: string
  costCenterId?: string
  type: CashMovementType
  description: string
  value: number
  sourceType?: SourceType
  sourceId?: string
  status: CashMovementStatus
  movementDate: Date
  competenceDate?: Date
  confirmedAt?: Date
  createdBy?: string
  confirmedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface FinancialForecast {
  id: string
  companyId: string
  accountId: string
  forecastDate: Date
  estimatedBalance: number
  estimatedInflow: number
  estimatedOutflow: number
  calculatedAt: Date
}

export interface FinancialAlert {
  id: string
  companyId: string
  alertType: AlertType
  severity: AlertSeverity
  description: string
  relatedId?: string
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CashFlowSummary {
  currentBalance: number
  monthlyInflow: number
  monthlyOutflow: number
  monthlyProfit: number
  accountsReceivable: number
  accountsPayable: number
  pendingPayments: number
  pendingReceipts: number
}

export interface FinancialDashboardKPIs {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  averageTicket: number
  outstandingValue: number
  pendingReceipts: number
  pendingPayments: number
}
