import type { Decimal } from 'decimal.js'

export type SalespersonStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'FIRED'

export interface Salesperson {
  id: string
  companyId: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  commissionRate: number
  status: SalespersonStatus
  hireDate?: Date
  notes?: string
  isSalesperson: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface SalespersonWithStats extends Salesperson {
  totalSalesMonth: number
  totalCommissionMonth: number
  commissionPending: number
  commissionPaid: number
  goalAchievement: number
  lastSaleDate?: Date
}

export interface CreateSalespersonInput {
  name: string
  email?: string
  phone?: string
  cpf?: string
  commissionRate: number
  hireDate?: Date
  notes?: string
}

export interface UpdateSalespersonInput {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  commissionRate?: number
  status?: SalespersonStatus
  hireDate?: Date
  notes?: string
}

export interface SalespersonFilters {
  searchTerm?: string
  status?: SalespersonStatus
  isSalesperson?: boolean
  skip?: number
  take?: number
  sortBy?: 'name' | 'commissionRate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CommissionRule {
  id: string
  companyId: string
  employeeId: string
  name: string
  description?: string
  ruleType: 'PERCENTAGE' | 'FIXED' | 'TIERED'
  basePercentage: number
  minValue?: number
  maxValue?: number
  tier1Percentage?: number
  tier1UpTo?: number
  tier2Percentage?: number
  tier2UpTo?: number
  tier3Percentage?: number
  isActive: boolean
  validFrom?: Date
  validUntil?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CommissionPayment {
  id: string
  companyId: string
  employeeId: string
  referenceMonth: number
  referenceYear: number
  totalCommission: number
  approvedCommission: number
  paidAmount: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  approvedBy?: string
  approvedAt?: Date
  paidAt?: Date
  paidVia?: string
  paymentReference?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface CommissionHistory {
  id: string
  companyId: string
  commissionPaymentId?: string
  employeeId: string
  osCommissionId?: string
  eventType: 'CREATED' | 'CALCULATED' | 'APPROVED' | 'RELEASED' | 'PAID' | 'REVERSED' | 'CANCELLED'
  description: string
  previousValue?: number
  newValue?: number
  createdBy?: string
  metadata?: string
  createdAt: Date
}

export interface SalespersonDashboard {
  salespersonId: string
  name: string
  totalSales: number
  totalCommission: number
  commissionPending: number
  commissionPaid: number
  goalProgress: number
  goalValue: number
  soldValue: number
  averageTicket: number
  salesCount: number
  conversionRate: number
}
