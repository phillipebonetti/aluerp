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
