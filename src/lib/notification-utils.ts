import type { NotificationType, NotificationPriority, NotificationCategory } from '@prisma/client'

export const NOTIFICATION_TYPES = {
  INFO: { label: 'Informação', color: 'bg-blue-500', icon: 'Info' },
  SUCCESS: { label: 'Sucesso', color: 'bg-green-500', icon: 'CheckCircle' },
  WARNING: { label: 'Aviso', color: 'bg-yellow-500', icon: 'AlertCircle' },
  ERROR: { label: 'Erro', color: 'bg-red-500', icon: 'XCircle' },
} as const

export const NOTIFICATION_PRIORITIES = {
  BAIXA: { label: 'Baixa', color: 'bg-gray-400', textColor: 'text-gray-700' },
  NORMAL: { label: 'Normal', color: 'bg-blue-400', textColor: 'text-blue-700' },
  ALTA: { label: 'Alta', color: 'bg-orange-400', textColor: 'text-orange-700' },
  URGENTE: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-700' },
} as const

export const NOTIFICATION_CATEGORIES = {
  SISTEMA: { label: 'Sistema', icon: 'Settings' },
  FINANCEIRO: { label: 'Financeiro', icon: 'DollarSign' },
  OBRAS: { label: 'Obras', icon: 'Briefcase' },
  CLIENTES: { label: 'Clientes', icon: 'Users' },
  ORCAMENTOS: { label: 'Orçamentos', icon: 'FileText' },
  FORNECEDORES: { label: 'Fornecedores', icon: 'Truck' },
  VENDAS: { label: 'Vendas', icon: 'ShoppingCart' },
  USUARIOS: { label: 'Usuários', icon: 'User' },
  BACKUP: { label: 'Backup', icon: 'Database' },
  INTEGRACAO: { label: 'Integração', icon: 'Plug' },
} as const

export function getPriorityColor(priority: NotificationPriority): string {
  return NOTIFICATION_PRIORITIES[priority]?.color || 'bg-gray-400'
}

export function getPriorityLabel(priority: NotificationPriority): string {
  return NOTIFICATION_PRIORITIES[priority]?.label || priority
}

export function getTypeColor(type: NotificationType): string {
  return NOTIFICATION_TYPES[type]?.color || 'bg-blue-500'
}

export function getTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPES[type]?.label || type
}

export function getCategoryLabel(category: NotificationCategory): string {
  return NOTIFICATION_CATEGORIES[category]?.label || category
}

export function getCategoryIcon(category: NotificationCategory): string {
  return NOTIFICATION_CATEGORIES[category]?.icon || 'Bell'
}

export function formatNotificationTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`

  return date.toLocaleDateString('pt-BR')
}

export function groupNotificationsByDate(
  notifications: any[]
): Record<string, any[]> {
  const groups: Record<string, any[]> = {
    'Hoje': [],
    'Ontem': [],
    'Esta Semana': [],
    'Este Mês': [],
    'Anterior': [],
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const monthAgo = new Date(today.getTime() - 30 * 86400000)

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt)
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

    if (notifDay.getTime() === today.getTime()) {
      groups['Hoje'].push(notif)
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups['Ontem'].push(notif)
    } else if (notifDay.getTime() > weekAgo.getTime()) {
      groups['Esta Semana'].push(notif)
    } else if (notifDay.getTime() > monthAgo.getTime()) {
      groups['Este Mês'].push(notif)
    } else {
      groups['Anterior'].push(notif)
    }
  })

  return Object.fromEntries(
    Object.entries(groups).filter(([_, notifs]) => notifs.length > 0)
  )
}

export function getDefaultNotificationTemplate(
  category: NotificationCategory,
  action: string
): { title: string; message: string } {
  const templates: Record<string, Record<string, { title: string; message: string }>> = {
    OBRAS: {
      created: { title: 'Nova Obra', message: 'Uma nova obra foi criada' },
      completed: { title: 'Obra Finalizada', message: 'Uma obra foi finalizada' },
      delayed: { title: 'Obra Atrasada', message: 'Uma obra está atrasada no cronograma' },
    },
    CLIENTES: {
      created: { title: 'Novo Cliente', message: 'Um novo cliente foi cadastrado' },
      updated: { title: 'Cliente Atualizado', message: 'Dados de cliente foram atualizados' },
    },
    ORCAMENTOS: {
      created: { title: 'Novo Orçamento', message: 'Um novo orçamento foi criado' },
      approved: { title: 'Orçamento Aprovado', message: 'Um orçamento foi aprovado' },
      rejected: { title: 'Orçamento Rejeitado', message: 'Um orçamento foi rejeitado' },
    },
    FINANCEIRO: {
      payment_received: { title: 'Pagamento Recebido', message: 'Um pagamento foi recebido' },
      payment_due: { title: 'Pagamento Vencido', message: 'Um pagamento está vencido' },
      invoice_created: { title: 'Fatura Criada', message: 'Uma nova fatura foi criada' },
    },
    SISTEMA: {
      backup_completed: { title: 'Backup Concluído', message: 'O backup do sistema foi concluído com sucesso' },
      error: { title: 'Erro do Sistema', message: 'Ocorreu um erro no sistema' },
    },
  }

  return templates[category]?.[action] || { title: 'Notificação', message: 'Uma ação foi realizada' }
}
