/**
 * Tipos de Orçamentos
 * Consolidação centralizada de tipos relacionados a gestão de orçamentos (Quotes)
 */

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
export type QuoteSource = 'LEAD' | 'CLIENT' | 'PROJECT'

export interface Quote {
  id: string
  companyId: string
  number: string
  clientId?: string
  leadId?: string
  projectId?: string
  source: QuoteSource
  status: QuoteStatus
  title: string
  description?: string
  subtotal: number
  discount: number
  discountPercent?: number
  tax: number
  total: number
  currency: string
  validityDays: number
  issueDate: Date
  expiryDate: Date
  sentDate?: Date
  acceptedDate?: Date
  rejectedDate?: Date
  rejectionReason?: string
  createdBy: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface QuoteItem {
  id: string
  quoteId: string
  sequence: number
  description: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[]
  client?: {
    id: string
    name: string
    email?: string
  }
  lead?: {
    id: string
    name: string
  }
  project?: {
    id: string
    name: string
  }
}

export interface CreateQuotePayload {
  clientId?: string
  leadId?: string
  projectId?: string
  title: string
  description?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
  discount?: number
  discountPercent?: number
  validityDays?: number
  notes?: string
}

export interface UpdateQuotePayload {
  title?: string
  description?: string
  discount?: number
  discountPercent?: number
  validityDays?: number
  notes?: string
  items?: {
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export interface QuoteFilters {
  search?: string
  status?: QuoteStatus
  source?: QuoteSource
  clientId?: string
  leadId?: string
  projectId?: string
  createdBy?: string
  createdAfter?: Date
  createdBefore?: Date
  expiredOnly?: boolean
}

export interface QuoteStats {
  totalQuotes: number
  draftQuotes: number
  sentQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  expiredQuotes: number
  conversionRate: number
  totalValue: number
  averageValue: number
  byStatus: Record<QuoteStatus, number>
  byMonth: Record<string, number>
}

export interface QuoteConversionPayload {
  projectName?: string
  projectClientId?: string
  startDate?: Date
  expectedEndDate?: Date
  notes?: string
}

export interface QuoteTemplate {
  id: string
  companyId: string
  name: string
  items: {
    description: string
    unitPrice: number
  }[]
  validityDays: number
  notes?: string
  createdAt: Date
}

export interface QuoteEmailPayload {
  to: string
  cc?: string[]
  message?: string
  includeAttachment: boolean
}
