'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressCardProps {
  title: string
  target: number
  current: number
  suffix?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
  showPercentage?: boolean
  icon?: React.ReactNode
}

const colorClasses = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export const ProgressCard = React.memo(function ProgressCard({
  title,
  target,
  current,
  suffix = '',
  color = 'default',
  showPercentage = true,
  icon,
}: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isCompleted = current >= target

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold">
              {current.toLocaleString('pt-BR')} {suffix}
            </span>
            <span className="text-xs text-muted-foreground">
              Meta: {target.toLocaleString('pt-BR')} {suffix}
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
            indicatorClassName={colorClasses[color]}
          />
        </div>

        {showPercentage && (
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-sm font-semibold',
              isCompleted
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            )}>
              {percentage.toFixed(1)}% concluído
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                Meta atingida!
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

ProgressCard.displayName = 'ProgressCard'
