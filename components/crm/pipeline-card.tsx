'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getDaysUntilDeadline, getDeadlineStatus } from '@/lib/crm/utils'
import type { CRMOpportunity } from '@/src/modules/crm/types'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface PipelineCardProps {
  opportunity: CRMOpportunity
  onClick?: () => void
  isSelected?: boolean
}

export function PipelineCard({
  opportunity,
  onClick,
  isSelected
}: PipelineCardProps) {
  const daysUntil = getDaysUntilDeadline(opportunity.expectedCloseDate)
  const status = getDeadlineStatus(daysUntil)

  const statusIcons = {
    urgent: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <Clock className="w-4 h-4 text-yellow-500" />,
    ok: <CheckCircle2 className="w-4 h-4 text-green-500" />
  }

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="font-semibold text-sm line-clamp-2">{opportunity.name}</h3>
        {statusIcons[status]}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Valor</span>
          <span className="text-sm font-semibold">{formatCurrency(opportunity.value)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Probabilidade</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${opportunity.probability}%` }}
              />
            </div>
            <span className="text-xs font-medium">{opportunity.probability}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Prazo</span>
          <span className={`text-xs font-medium ${
            status === 'urgent' ? 'text-red-600' :
            status === 'warning' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {daysUntil} dias
          </span>
        </div>

        <div className="pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {opportunity.stage}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
