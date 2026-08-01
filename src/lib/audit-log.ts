import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { AuditAction, AuditModule } from '@prisma/client'
import UAParser from 'ua-parser-js'

export interface LogAuditInput {
  module: AuditModule | string
  action: AuditAction | string
  entity: string
  entityId: string
  entityName?: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  companyId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  description?: string
  success?: boolean
  errorMessage?: string
}

/**
 * Registra uma ação no log de auditoria
 * Captura automaticamente IP, User-Agent e cria comparação de dados
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    // Capturar IP da requisição
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      'unknown'

    // Capturar User-Agent e fazer parsing
    const userAgent = headersList.get('user-agent') || 'unknown'
    const parser = new UAParser(userAgent)
    const browserInfo = parser.getResult()

    // Calcular campos alterados
    const changedFields: string[] = []
    if (input.oldValues && input.newValues) {
      for (const [key, oldValue] of Object.entries(input.oldValues)) {
        const newValue = input.newValues[key]
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changedFields.push(key)
        }
      }
    }

    // Salvar no banco
    await prisma.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        userRole: input.userRole,
        module: input.module as AuditModule,
        action: input.action as AuditAction,
        entity: input.entity,
        entityId: input.entityId,
        entityName: input.entityName,
        oldData: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newData: input.newValues ? JSON.stringify(input.newValues) : null,
        changedFields: changedFields.length > 0 ? JSON.stringify(changedFields) : null,
        ipAddress,
        userAgent: `${browserInfo.browser.name || 'Unknown'} ${browserInfo.browser.version || ''}`,
        description: input.description,
        success: input.success ?? true,
        errorMessage: input.errorMessage,
      },
    })
  } catch (error) {
    // Não falhar a operação principal se o log falhar
    console.error('[Audit] Erro ao registrar log:', error)
  }
}

/**
 * Compara dois objetos e retorna as diferenças
 */
export function getChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {}

  for (const key of new Set([...Object.keys(oldValues), ...Object.keys(newValues)])) {
    const oldValue = oldValues[key]
    const newValue = newValues[key]

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { old: oldValue, new: newValue }
    }
  }

  return changes
}

/**
 * Formata o User-Agent para exibição legível
 */
export function formatUserAgent(userAgent: string): string {
  if (!userAgent) return 'Desconhecido'
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  return `${browser.name || 'Unknown'} em ${os.name || 'Unknown'}`
}

/**
 * Formata ação para exibição legível
 */
export function formatAction(action: string): string {
  const actions: Record<string, string> = {
    CREATE: 'Criado',
    UPDATE: 'Atualizado',
    DELETE: 'Deletado',
    RESTORE: 'Restaurado',
    DUPLICATE: 'Duplicado',
    EXPORT: 'Exportado',
    IMPORT: 'Importado',
    GENERATE_PDF: 'PDF Gerado',
    SEND_EMAIL: 'Email Enviado',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    APPROVE: 'Aprovado',
    REJECT: 'Rejeitado',
    CANCEL: 'Cancelado',
    STATUS_CHANGE: 'Status Alterado',
  }
  return actions[action] || action
}

/**
 * Formata módulo para exibição legível
 */
export function formatModule(module: string): string {
  const modules: Record<string, string> = {
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
  return modules[module] || module
}
