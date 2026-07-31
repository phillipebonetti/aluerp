/**
 * Constantes de Status da Aplicação
 * Define todos os status possíveis e suas informações
 */

// User and Company Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export const USER_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
} as const

export const MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  INVITED: 'INVITED',
} as const

export const MEMBER_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  INVITED: 'Convidado',
} as const

export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export const COMPANY_STATUS_LABELS = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  SUSPENDED: 'Suspensa',
} as const

// Client Status
export const CLIENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const

export const CLIENT_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
} as const

// Project Status
export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ON_HOLD: 'ON_HOLD',
} as const

export const PROJECT_STATUS_LABELS = {
  PLANNING: 'Planejamento',
  ACTIVE: 'Em Andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  ON_HOLD: 'Pausada',
} as const

export const PROJECT_STATUS_COLORS = {
  PLANNING: 'bg-blue-100 text-blue-800 border-blue-300',
  ACTIVE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  ON_HOLD: 'bg-gray-100 text-gray-800 border-gray-300',
} as const

// Quote Status
export const QUOTE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const

export const QUOTE_STATUS_LABELS = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  VIEWED: 'Visualizado',
  ACCEPTED: 'Aceito',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
} as const

export const QUOTE_STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-800 border-slate-300',
  SENT: 'bg-blue-100 text-blue-800 border-blue-300',
  VIEWED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  EXPIRED: 'bg-orange-100 text-orange-800 border-orange-300',
} as const

// Service Order Status
export const SERVICE_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ON_HOLD: 'ON_HOLD',
} as const

export const SERVICE_ORDER_STATUS_LABELS = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Execução',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  ON_HOLD: 'Pausada',
} as const

export const SERVICE_ORDER_STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-800 border-slate-300',
  SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  ON_HOLD: 'bg-gray-100 text-gray-800 border-gray-300',
} as const

// Supplier Status
export const SUPPLIER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export const SUPPLIER_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  BLOCKED: 'Bloqueado',
} as const

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const

export const TRANSACTION_STATUS_LABELS = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  FAILED: 'Falhou',
} as const

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED',
} as const

export const EMPLOYEE_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  ON_LEAVE: 'De Licença',
  SUSPENDED: 'Suspenso',
} as const

// Bank Account Status
export const BANK_ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CLOSED: 'CLOSED',
} as const

export const BANK_ACCOUNT_STATUS_LABELS = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  CLOSED: 'Fechada',
} as const
