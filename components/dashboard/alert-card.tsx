'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  action?: {
    label: string
    onClick: () => void
  }
  dismissed?: boolean
  onDismiss?: () => void
}

const severityConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-100',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-900 dark:text-amber-100',
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-900 dark:text-red-100',
    accentColor: 'text-red-600 dark:text-red-400',
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-900 dark:text-green-100',
    accentColor: 'text-green-600 dark:text-green-400',
  },
}

export const AlertCard = React.memo(function AlertCard({
  title,
  message,
  severity,
  action,
  dismissed,
  onDismiss,
}: AlertCardProps) {
  if (dismissed) return null

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <Card className={cn(config.bgColor, 'border', config.borderColor)}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.accentColor)} />
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold text-sm mb-1', config.textColor)}>
              {title}
            </h4>
            <p className={cn('text-sm', config.textColor)}>
              {message}
            </p>
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  'text-sm font-medium mt-3 hover:underline',
                  config.accentColor
                )}
              >
                {action.label} →
              </button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 text-sm hover:opacity-70 transition-opacity',
                config.accentColor
              )}
            >
              ✕
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

AlertCard.displayName = 'AlertCard'
