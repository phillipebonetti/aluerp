'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface ReminderCardProps {
  title: string
  dueDate: Date
  priority: 'baixa' | 'média' | 'alta'
  status: 'pendente' | 'completed'
  onComplete?: () => void
  onEdit?: () => void
}

const priorityColors = {
  'baixa': 'bg-blue-100 text-blue-800',
  'média': 'bg-yellow-100 text-yellow-800',
  'alta': 'bg-red-100 text-red-800'
}

const priorityLabels = {
  'baixa': 'Baixa',
  'média': 'Média',
  'alta': 'Alta'
}

export function ReminderCard({
  title,
  dueDate,
  priority,
  status,
  onComplete,
  onEdit
}: ReminderCardProps) {
  const isCompleted = status === 'completed'
  const isOverdue = !isCompleted && new Date(dueDate) < new Date()

  return (
    <Card className={`p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : isOverdue ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <h4 className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(dueDate), 'dd MMM yyyy HH:mm', { locale: ptBR })}
            </span>
            <Badge className={priorityColors[priority]} variant="secondary">
              {priorityLabels[priority]}
            </Badge>
            {isOverdue && !isCompleted && (
              <Badge variant="destructive" className="text-xs">
                Atrasado
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && onComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={onComplete}
              className="text-xs"
            >
              Concluir
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="text-xs"
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
