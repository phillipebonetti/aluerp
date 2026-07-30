'use client'

import { Card } from '@/components/ui/card'
import type { CRMInteraction } from '@/src/modules/crm/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react'

interface ActivityTimelineProps {
  activities: CRMInteraction[]
  isLoading?: boolean
}

const typeIcons = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  message: MessageSquare
}

const typeLabels = {
  email: 'Email',
  call: 'Ligação',
  meeting: 'Reunião',
  message: 'Mensagem'
}

const typeColors = {
  email: 'bg-blue-100 text-blue-800',
  call: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800',
  message: 'bg-yellow-100 text-yellow-800'
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando atividades...</div>
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma atividade registrada</div>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = typeIcons[activity.type]
        return (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Card className={`p-2 ${typeColors[activity.type]}`}>
                <Icon className="w-4 h-4" />
              </Card>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="font-medium text-sm">{activity.subject}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {typeLabels[activity.type]} • {format(new Date(activity.createdAt), 'dd MMM yyyy HH:mm', { locale: ptBR })}
              </div>
              {activity.notes && (
                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  {activity.notes}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
