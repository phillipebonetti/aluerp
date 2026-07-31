'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { NotificationCard } from './notification-card'
import { getUserNotificationsAction, markAsReadAction, deleteNotificationAction } from '@/src/actions/notifications'
import type { Notification } from '@prisma/client'

interface NotificationBellProps {
  userId: string
  companyId: string
  unreadCount?: number
}

export function NotificationBell({ userId, companyId, unreadCount = 0 }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(unreadCount)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  async function loadNotifications() {
    setLoading(true)
    try {
      const result = await getUserNotificationsAction(userId, companyId, { limit: 5 })
      if (result.success) {
        setNotifications(result.data.notifications)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    await markAsReadAction(id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'READ' as const, readAt: new Date() } : n
      )
    )
    setCount(Math.max(0, count - 1))
  }

  async function handleDelete(id: string) {
    await deleteNotificationAction(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadNotifications = notifications.filter((n) => n.status === 'UNREAD')

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Notificações</h2>
          <p className="text-sm text-gray-600">
            {unreadNotifications.length} não lida{unreadNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma notificação</div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setIsOpen(false)
              // Navigate to notifications page
              window.location.href = '/notificacoes'
            }}
          >
            Ver Todas as Notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
