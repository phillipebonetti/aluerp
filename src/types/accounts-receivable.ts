export type ReceivableStatus = 'ABERTO' | 'PARCIALMENTE_RECEBIDO' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO'
export type ReceivableType = 'VENDA' | 'SERVIÇO' | 'MANUAL'
export type PaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFERENCIA' | 'CHEQUE' | 'DINHEIRO' | 'CARTAO'
export type ReceivableEventType = 'CREATED' | 'MODIFIED' | 'PAYMENT_RECEIVED' | 'PAYMENT_REVERSED' | 'OVERDUE' | 'CANCELLED' | 'STATUS_CHANGED'

export interface AccountsReceivable {
  id: string
  companyId: string
  clientId: string
  quoteId?: string
  serviceOrderId?: string
  documentNumber: string
  type: ReceivableType
  category: string
  costCenterId?: string
  totalValue: number
  receivedValue: number
  discountValue: number
  finalBalance: number
  status: ReceivableStatus
  issueDate: Date
  dueDate: Date
  receivedDate?: Date
  notes?: string
  createdBy?: string
  approvedBy?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  client?: {
    id: string
    name: string
  }
  quote?: {
    id: string
    number: string
  }
  serviceOrder?: {
    id: string
    number: string
  }
}

export interface ReceivableInstallment {
  id: string
  accountsReceivableId: string
  installmentNumber: number
  value: number
  receivedValue: number
  status: ReceivableStatus
  dueDate: Date
  receivedDate?: Date
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface ReceivablePayment {
  id: string
  accountsReceivableId: string
  installmentId?: string
  companyId: string
  paymentReference?: string
  amount: number
  paymentMethod: PaymentMethod
  financialAccountId?: string
  paymentDate: Date
  recordedAt: Date
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'
  createdBy: string
  cancelledBy?: string
  cancelledAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReceivableHistory {
  id: string
  accountsReceivableId: string
  paymentId?: string
  companyId: string
  eventType: ReceivableEventType
  description: string
  previousValue?: number
  newValue?: number
  createdBy?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface ReceivableSummary {
  totalReceivable: number
  receivedThisMonth: number
  openAmount: number
  overdueAmount: number
  receivedToday: number
  upcomingDays: Array<{
    date: Date
    amount: number
    count: number
  }>
}

export interface ReceivableDashboardKPI {
  projectedRevenue: number
  realizedRevenue: number
  overdueAmount: number
  defaultRate: number
  averageTicket: number
  averageReceiptTerm: number
}
