'use client'

import React from 'react'
import { Trash2, Archive, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getPriorityColor,
  getPriorityLabel,
  getTypeColor,
  getCategoryLabel,
  formatNotificationTime,
} from '@/src/lib/notification-utils'
import type { Notification } from '@prisma/client'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onAction?: () => void
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onArchive,
  onAction,
}: NotificationCardProps) {
  return (
    <div
      className={`flex gap-4 p-4 border rounded-lg transition-all ${
        notification.status === 'UNREAD'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className={`${getTypeColor(notification.type)} w-1 rounded-full`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
          <div className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(notification.priority)} text-white whitespace-nowrap`}>
            {getPriorityLabel(notification.priority)}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>{getCategoryLabel(notification.category)}</span>
          <span>{formatNotificationTime(notification.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {notification.actionUrl && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAction}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        {onMarkAsRead && notification.status === 'UNREAD' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMarkAsRead(notification.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✓
          </Button>
        )}
        {onArchive && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onArchive(notification.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Archive className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(notification.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
