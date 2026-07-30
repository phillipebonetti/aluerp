/**
 * CRM Module Types
 * Tipos e interfaces para o módulo de Customer Relationship Management
 */

export interface CRMLead {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  source: 'website' | 'email' | 'phone' | 'referral' | 'social' | 'other'
  status: 'novo' | 'em_contato' | 'interessado' | 'proposta' | 'perdido'
  value?: number
  expectedCloseDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CRMOpportunity {
  id: string
  companyId: string
  clientId: string
  name: string
  stage: 'prospecção' | 'qualificação' | 'proposta' | 'negociação' | 'fechamento'
  value: number
  probability: number
  expectedCloseDate: Date
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
