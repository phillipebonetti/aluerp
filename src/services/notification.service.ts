import { getPrisma } from '@/src/core/database'
import type {
  Notification,
  NotificationLog,
  NotificationPreference,
} from '@prisma/client'
import type {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '@prisma/client'

export interface CreateNotificationInput {
  userId: string
  companyId: string
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  category?: NotificationCategory
  actionUrl?: string
  icon?: string
}

export interface SendNotificationInput extends CreateNotificationInput {
  channels?: Array<'internal' | 'email' | 'push' | 'whatsapp'>
}

export class NotificationService {
  private prisma = getPrisma()

  /**
   * Criar notificação
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        title: input.title,
        message: input.message,
        type: input.type || 'INFO',
        priority: input.priority || 'NORMAL',
        category: input.category || 'SISTEMA',
        actionUrl: input.actionUrl,
        icon: input.icon,
      },
    })
  }

  /**
   * Obter notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    companyId: string,
    options?: {
      status?: 'UNREAD' | 'READ' | 'ARCHIVED'
      category?: NotificationCategory
      priority?: NotificationPriority
      limit?: number
      offset?: number
    }
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = {
      userId,
      companyId,
      deletedAt: null,
    }

    if (options?.status) {
      where.status = options.status
    }

    if (options?.category) {
      where.category = options.category
    }

    if (options?.priority) {
      where.priority = options.priority
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0,
      }),
      this.prisma.notification.count({ where }),
    ])

    return { notifications, total }
  }

  /**
   * Marcar como lida
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date(), status: 'READ' },
    })
  }

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead(
    userId: string,
    companyId: string
  ): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        companyId,
        status: 'UNREAD',
        deletedAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    })

    return { count: result.count }
  }

  /**
   * Arquivar notificação
   */
  async archive(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'ARCHIVED' },
    })
  }

  /**
   * Deletar notificação
   */
  async delete(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Obter contagem de não lidas
   */
  async getUnreadCount(
    userId: string,
    companyId: string
  ): Promise<{ unread: number; urgent: number }> {
    const [unread, urgent] = await Promise.all([
      this.prisma.notification.count({
        where: {
          userId,
          companyId,
          status: 'UNREAD',
          deletedAt: null,
        },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          companyId,
          status: 'UNREAD',
          priority: 'URGENTE',
          deletedAt: null,
        },
      }),
    ])

    return { unread, urgent }
  }

  /**
   * Registrar log de notificação
   */
  async createLog(input: {
    notificationId: string
    channel: 'INTERNAL' | 'EMAIL' | 'PUSH' | 'WHATSAPP'
    status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING'
    error?: string
    attemptNumber?: number
  }): Promise<NotificationLog> {
    return this.prisma.notificationLog.create({
      data: {
        notificationId: input.notificationId,
        channel: input.channel,
        status: input.status,
        error: input.error,
        attemptNumber: input.attemptNumber || 1,
      },
    })
  }

  /**
   * Obter preferências do usuário
   */
  async getPreference(
    userId: string,
    companyId: string
  ): Promise<NotificationPreference | null> {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    })
  }

  /**
   * Atualizar preferências
   */
  async updatePreference(
    userId: string,
    companyId: string,
    input: Partial<Omit<NotificationPreference, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<NotificationPreference> {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        companyId,
        ...input,
      },
      update: input,
    })
  }

  /**
   * Verificar se usuário está em modo silencioso
   */
  async isInSilentMode(userId: string): Promise<boolean> {
    const preference = await this.getPreference(userId, '')
    if (!preference || !preference.silentMode) return false

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (!preference.silentStart || !preference.silentEnd) return false

    // Comparar horários como strings
    if (preference.silentStart < preference.silentEnd) {
      return currentTime >= preference.silentStart && currentTime <= preference.silentEnd
    } else {
      // Caso noturno (ex: 22:00 até 06:00)
      return currentTime >= preference.silentStart || currentTime <= preference.silentEnd
    }
  }

  /**
   * Limpar notificações antigas (older than 30 days)
   */
  async cleanupOldNotifications(companyId: string): Promise<{ deleted: number }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await this.prisma.notification.updateMany({
      where: {
        companyId,
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ['READ', 'ARCHIVED'] },
      },
      data: { deletedAt: new Date() },
    })

    return { deleted: result.count }
  }
}

export const notificationService = new NotificationService()
