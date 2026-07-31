/**
 * Tipos de Obras e Projetos
 * Consolidação centralizada de tipos relacionados a gestão de obras
 */

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Project {
  id: string
  companyId: string
  clientId: string
  name: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: Date
  expectedEndDate: Date
  actualEndDate?: Date
  budget: number
  spent: number
  responsibleId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ProjectPhoto {
  id: string
  projectId: string
  url: string
  caption?: string
  uploadedBy: string
  uploadedAt: Date
}

export interface ProjectDocument {
  id: string
  projectId: string
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: Date
}

export interface ProjectCost {
  id: string
  projectId: string
  description: string
  amount: number
  category: string
  date: Date
  paidDate?: Date
  status: 'PENDING' | 'PARTIAL' | 'PAID'
  notes?: string
  createdAt: Date
}

export interface ProjectWithRelations extends Project {
  photos?: ProjectPhoto[]
  documents?: ProjectDocument[]
  costs?: ProjectCost[]
  client?: {
    id: string
    name: string
  }
  responsible?: {
    id: string
    name: string
  }
}

export interface CreateProjectPayload {
  clientId: string
  name: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  startDate: Date
  expectedEndDate: Date
  budget: number
  priority?: ProjectPriority
  responsibleId?: string
  notes?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  expectedEndDate?: Date
  budget?: number
  responsibleId?: string
  notes?: string
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  clientId?: string
  responsibleId?: string
  startDateAfter?: Date
  startDateBefore?: Date
  city?: string
  state?: string
}

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  cancelledProjects: number
  totalBudget: number
  totalSpent: number
  byStatus: Record<ProjectStatus, number>
  byPriority: Record<ProjectPriority, number>
  overBudgetCount: number
}

export interface ProjectTimeline {
  projectId: string
  milestones: {
    date: Date
    description: string
    status: 'PENDING' | 'COMPLETED'
  }[]
}
