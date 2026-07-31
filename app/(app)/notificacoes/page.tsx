'use client'

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Inbox, Trash2, Archive, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationCard } from '@/components/notifications/notification-card'
import { groupNotificationsByDate, NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '@/src/lib/notification-utils'
import {
  getUserNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
  archiveNotificationAction,
} from '@/src/actions/notifications'
import type { NotificationCategory, NotificationPriority } from '@prisma/client'

interface NotificationFilter {
  status?: 'UNREAD' | 'READ' | 'ARCHIVED'
  category?: NotificationCategory
  priority?: NotificationPriority
}

export default function NotificationsPage() {
  const session = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotificationFilter>({ status: 'UNREAD' })
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const limit = 20

  React.useEffect(() => {
    loadNotifications()
  }, [filters, page])

  async function loadNotifications() {
    if (!session.data?.user) return

    setLoading(true)
    try {
      const result = await getUserNotificationsAction(
        session.data.user.id,
        session.data.user.companyId,
        {
          ...filters,
          limit,
          offset: page * limit,
        }
      )

      if (result.success) {
        setNotifications(result.data.notifications)
        setTotal(result.data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsReadAction(id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'READ', readAt: new Date() } : n
      )
    )
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    if (!session.data?.user) return

    await markAllAsReadAction(session.data.user.id, session.data.user.companyId)
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'READ' as const, readAt: new Date() }))
    )
  }, [session])

  const handleDelete = useCallback(async (id: string) => {
    await deleteNotificationAction(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleArchive = useCallback(async (id: string) => {
    await archiveNotificationAction(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const grouped = groupNotificationsByDate(notifications)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
        <p className="text-gray-600">Gerencie todas as suas notificações</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">Não Lidas</p>
          <p className="text-2xl font-bold text-blue-600">
            {notifications.filter((n) => n.status === 'UNREAD').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">Alta Prioridade</p>
          <p className="text-2xl font-bold text-red-600">
            {notifications.filter((n) => n.priority === 'URGENTE').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600">Hoje</p>
          <p className="text-2xl font-bold text-green-600">
            {notifications.filter((n) => {
              const today = new Date()
              const notifDate = new Date(n.createdAt)
              return notifDate.toDateString() === today.toDateString()
            }).length}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={filters.status === 'UNREAD' ? 'default' : 'outline'}
          onClick={() => {
            setFilters({ ...filters, status: 'UNREAD' })
            setPage(0)
          }}
        >
          Não Lidas
        </Button>
        <Button
          variant={filters.status === 'READ' ? 'default' : 'outline'}
          onClick={() => {
            setFilters({ ...filters, status: 'READ' })
            setPage(0)
          }}
        >
          Lidas
        </Button>
        <Button
          variant={!filters.status ? 'default' : 'outline'}
          onClick={() => {
            setFilters({ category: filters.category, priority: filters.priority })
            setPage(0)
          }}
        >
          Todas
        </Button>

        {notifications.length > 0 && filters.status === 'UNREAD' && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="ml-auto"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Notifications */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date} className="space-y-2">
              <h2 className="font-semibold text-gray-700">{date}</h2>
              <div className="space-y-2">
                {notifs.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Button variant="outline" disabled>
            Página {page + 1} de {Math.ceil(total / limit)}
          </Button>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / limit) - 1}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
