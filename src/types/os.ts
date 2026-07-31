/**
 * Tipos de Ordens de Serviço
 * Consolidação centralizada de tipos relacionados a gestão de OS (Service Orders)
 */

export type ServiceOrderStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type ServiceOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ServiceOrder {
  id: string
  companyId: string
  number: string
  projectId?: string
  clientId?: string
  quoteId?: string
  title: string
  description?: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  estimatedHours: number
  actualHours?: number
  startDate?: Date
  endDate?: Date
  completedAt?: Date
  team: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ServiceOrderItem {
  id: string
  serviceOrderId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: string
}

export interface ServiceOrderAttachment {
  id: string
  serviceOrderId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: Date
}

export interface ServiceOrderUpdate {
  id: string
  serviceOrderId: string
  updateType: 'STATUS_CHANGE' | 'TIME_LOG' | 'NOTE' | 'ATTACHMENT'
  description: string
  updatedBy: string
  createdAt: Date
  metadata?: Record<string, any>
}

export interface ServiceOrderWithRelations extends ServiceOrder {
  items?: ServiceOrderItem[]
  attachments?: ServiceOrderAttachment[]
  updates?: ServiceOrderUpdate[]
  project?: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
  }
  quote?: {
    id: string
    number: string
    total: number
  }
}

export interface CreateServiceOrderPayload {
  projectId?: string
  clientId?: string
  quoteId?: string
  title: string
  description?: string
  priority?: ServiceOrderPriority
  estimatedHours: number
  startDate?: Date
  team?: string[]
  notes?: string
}

export interface UpdateServiceOrderPayload {
  title?: string
  description?: string
  status?: ServiceOrderStatus
  priority?: ServiceOrderPriority
  estimatedHours?: number
  actualHours?: number
  team?: string[]
  notes?: string
}

export interface ServiceOrderFilters {
  search?: string
  status?: ServiceOrderStatus
  priority?: ServiceOrderPriority
  projectId?: string
  clientId?: string
  teamMember?: string
  createdAfter?: Date
  createdBefore?: Date
  startedAfter?: Date
  startedBefore?: Date
}

export interface ServiceOrderStats {
  totalOrders: number
  openOrders: number
  completedOrders: number
  cancelledOrders: number
  byStatus: Record<ServiceOrderStatus, number>
  byPriority: Record<ServiceOrderPriority, number>
  totalHours: number
  averageHoursPerOrder: number
  totalValue: number
}

export interface TimeLog {
  id: string
  serviceOrderId: string
  employeeId: string
  date: Date
  hours: number
  description: string
  createdAt: Date
}

export interface ServiceOrderCompletion {
  serviceOrderId: string
  completedAt: Date
  totalHours: number
  notes?: string
  attachments?: string[]
  clientSignature?: string
  rating?: number
}

export type OSWorkflow = {
  draft: {
    next: ['SCHEDULED', 'CANCELLED']
  }
  scheduled: {
    next: ['IN_PROGRESS', 'CANCELLED']
  }
  in_progress: {
    next: ['COMPLETED', 'PAUSED', 'CANCELLED']
  }
  paused: {
    next: ['IN_PROGRESS', 'CANCELLED']
  }
  completed: {
    next: []
  }
  cancelled: {
    next: []
  }
}
