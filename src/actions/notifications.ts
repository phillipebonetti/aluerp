'use server'

import { notificationService } from '@/src/services/notification.service'
import type { NotificationType, NotificationPriority, NotificationCategory } from '@prisma/client'

export async function createNotificationAction(input: {
  userId: string
  companyId: string
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  category?: NotificationCategory
  actionUrl?: string
  icon?: string
}) {
  try {
    const notification = await notificationService.create(input)
    return { success: true, data: notification }
  } catch (error) {
    console.error('[Notifications] Erro ao criar notificação:', error)
    return { success: false, error: 'Falha ao criar notificação' }
  }
}

export async function getUserNotificationsAction(
  userId: string,
  companyId: string,
  options?: {
    status?: 'UNREAD' | 'READ' | 'ARCHIVED'
    category?: NotificationCategory
    priority?: NotificationPriority
    limit?: number
    offset?: number
  }
) {
  try {
    const result = await notificationService.getUserNotifications(userId, companyId, options)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Notifications] Erro ao obter notificações:', error)
    return { success: false, error: 'Falha ao obter notificações' }
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    const notification = await notificationService.markAsRead(notificationId)
    return { success: true, data: notification }
  } catch (error) {
    console.error('[Notifications] Erro ao marcar como lida:', error)
    return { success: false, error: 'Falha ao marcar como lida' }
  }
}

export async function markAllAsReadAction(userId: string, companyId: string) {
  try {
    const result = await notificationService.markAllAsRead(userId, companyId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Notifications] Erro ao marcar todas como lidas:', error)
    return { success: false, error: 'Falha ao marcar todas como lidas' }
  }
}

export async function deleteNotificationAction(notificationId: string) {
  try {
    const notification = await notificationService.delete(notificationId)
    return { success: true, data: notification }
  } catch (error) {
    console.error('[Notifications] Erro ao deletar notificação:', error)
    return { success: false, error: 'Falha ao deletar notificação' }
  }
}

export async function archiveNotificationAction(notificationId: string) {
  try {
    const notification = await notificationService.archive(notificationId)
    return { success: true, data: notification }
  } catch (error) {
    console.error('[Notifications] Erro ao arquivar notificação:', error)
    return { success: false, error: 'Falha ao arquivar notificação' }
  }
}

export async function getUnreadCountAction(userId: string, companyId: string) {
  try {
    const result = await notificationService.getUnreadCount(userId, companyId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Notifications] Erro ao obter contagem:', error)
    return { success: false, error: 'Falha ao obter contagem' }
  }
}

export async function updatePreferenceAction(
  userId: string,
  companyId: string,
  input: any
) {
  try {
    const preference = await notificationService.updatePreference(userId, companyId, input)
    return { success: true, data: preference }
  } catch (error) {
    console.error('[Notifications] Erro ao atualizar preferência:', error)
    return { success: false, error: 'Falha ao atualizar preferência' }
  }
}
