import { AuditLog, AuditAction, AuditModule } from '@prisma/client'

export interface AuditHistoryItem {
  id: string
  createdAt: Date
  action: AuditAction
  userName: string
  description?: string
  changedFields: string[]
}

export interface AuditComparison {
  [field: string]: {
    before: any
    after: any
  }
}

export interface AuditStatistics {
  totalActions: number
  activeUsers: number
  actionsToday: number
  loginsToday: number
  failedLogins: number
  deletions: number
  creations: number
  updates: number
}

export interface AuditFilter {
  userId?: string
  module?: AuditModule
  action?: AuditAction
  entity?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface AuditLogResponse {
  logs: AuditLog[]
  total: number
  pages: number
}

export const actionLabels: Record<AuditAction, string> = {
  CREATE: 'Criado',
  UPDATE: 'Atualizado',
  DELETE: 'Deletado',
  RESTORE: 'Restaurado',
  DUPLICATE: 'Duplicado',
  EXPORT: 'Exportado',
  IMPORT: 'Importado',
  APPROVE: 'Aprovado',
  REJECT: 'Recusado',
  CANCEL: 'Cancelado',
  STATUS_CHANGE: 'Status alterado',
  PERMISSION_CHANGE: 'Permissão alterada',
  CONFIG_CHANGE: 'Configuração alterada',
  BACKUP: 'Backup realizado',
  LOGIN: 'Login realizado',
  LOGOUT: 'Logout realizado',
  LOGIN_FAILED: 'Tentativa de login falhou',
  PASSWORD_RESET: 'Senha resetada',
  PASSWORD_CHANGE: 'Senha alterada',
  PROFILE_UPDATE: 'Perfil atualizado',
  COMMISSION_UPDATE: 'Comissão atualizada',
  ATTACHMENT_UPLOAD: 'Anexo enviado',
  ATTACHMENT_DELETE: 'Anexo removido',
}

export const moduleLabels: Record<AuditModule, string> = {
  CLIENTS: 'Clientes',
  SUPPLIERS: 'Fornecedores',
  WORKS: 'Obras',
  WORK_ORDERS: 'Ordens de Serviço',
  BUDGETS: 'Orçamentos',
  EXPENSES: 'Despesas',
  REVENUES: 'Receitas',
  ACCOUNTS_PAYABLE: 'Contas a Pagar',
  ACCOUNTS_RECEIVABLE: 'Contas a Receber',
  PIX_TRANSACTIONS: 'Transações PIX',
  ATTACHMENTS: 'Anexos',
  USERS: 'Usuários',
  PERMISSIONS: 'Permissões',
  SETTINGS: 'Configurações',
  INTEGRATIONS: 'Integrações',
  REPORTS: 'Relatórios',
  AUTH: 'Autenticação',
}

export function getActionColor(action: AuditAction): string {
  switch (action) {
    case 'CREATE':
      return 'bg-green-100 text-green-800'
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800'
    case 'DELETE':
      return 'bg-red-100 text-red-800'
    case 'APPROVE':
      return 'bg-emerald-100 text-emerald-800'
    case 'REJECT':
      return 'bg-orange-100 text-orange-800'
    case 'LOGIN_FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getActionIcon(action: AuditAction): string {
  switch (action) {
    case 'CREATE':
      return '🆕'
    case 'UPDATE':
      return '✏️'
    case 'DELETE':
      return '🗑️'
    case 'RESTORE':
      return '♻️'
    case 'APPROVE':
      return '✅'
    case 'REJECT':
      return '❌'
    case 'LOGIN':
      return '🔓'
    case 'LOGOUT':
      return '🔒'
    default:
      return '📝'
  }
}
