/**
 * CRM Module Types
 * Tipos e interfaces para o módulo de Customer Relationship Management
 */

export interface CRMLead {
  id: string
  companyId: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  cpf?: string
  cnpj?: string
  city?: string
  state?: string
  zipCode?: string
  address?: string
  source: 'INSTAGRAM' | 'FACEBOOK' | 'GOOGLE' | 'INDICACAO' | 'SITE' | 'MARKETPLACE' | 'OUTRO'
  interests?: string
  estimatedValue?: number
  responsibleId?: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST'
  lastContactAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CRMOpportunity {
  id: string
  companyId: string
  leadId: string
  clientId?: string
  stage: 'NEW_LEAD' | 'FIRST_CONTACT' | 'VISIT_SCHEDULED' | 'QUOTE_SENT' | 'NEGOTIATION' | 'CLOSED' | 'LOST'
  value: number
  probability: number
  responsibleId?: string
  lastContactAt?: Date
  nextActionDate?: Date
  expectedCloseDate?: Date
  status: 'OPEN' | 'CLOSED_WON' | 'CLOSED_LOST'
  lossReasonId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CRMInteraction {
  id: string
  companyId: string
  leadId?: string
  opportunityId?: string
  type: 'email' | 'call' | 'meeting' | 'message'
  subject: string
  notes: string
  createdBy: string
  createdAt: Date
}

export interface CRMTask {
  id: string
  companyId: string
  relatedTo: 'lead' | 'opportunity' | 'client'
  relatedId: string
  title: string
  description?: string
  dueDate: Date
  assignedTo: string
  status: 'pendente' | 'em_progresso' | 'concluído'
  priority: 'baixa' | 'média' | 'alta'
  createdAt: Date
  updatedAt: Date
}

// Pipeline related types
export interface PipelineStageData {
  stage: CRMOpportunity['stage']
  count: number
  totalValue: number
  avgProbability: number
}

export interface ConversionData {
  stage: CRMOpportunity['stage']
  count: number
  converted: number
  rate: number
}

export interface FunnelData {
  stage: string
  count: number
  value: number
  percentage: number
}

export interface CRMStats {
  totalLeads: number
  totalOpportunities: number
  pipelineValue: number
  conversionRate: number
  avgDealValue: number
  closedDeals: number
  lostDeals: number
  activeTasks: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'meeting' | 'call' | 'email' | 'reminder'
  attendees?: string[]
  location?: string
  relatedTo?: 'lead' | 'opportunity'
  relatedId?: string
  companyId: string
  createdBy: string
}

export interface LeadSource {
  name: string
  count: number
  percentage: number
}

export interface SalesRepPerformance {
  repId: string
  repName: string
  closed: number
  pending: number
  totalValue: number
}
