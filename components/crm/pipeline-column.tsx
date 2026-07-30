'use client'

import { Card } from '@/components/ui/card'
import { PipelineCard } from './pipeline-card'
import { formatCurrency, STAGE_LABELS, STAGE_COLORS } from '@/lib/crm/utils'
import type { CRMOpportunity } from '@/src/modules/crm/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PipelineColumnProps {
  stage: CRMOpportunity['stage']
  opportunities: CRMOpportunity[]
  onCardClick?: (opportunity: CRMOpportunity) => void
  selectedId?: string
}

export function PipelineColumn({
  stage,
  opportunities,
  onCardClick,
  selectedId
}: PipelineColumnProps) {
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0)

  return (
    <Card className="flex flex-col h-full bg-gray-50">
      <div className={`p-4 border-b ${STAGE_COLORS[stage]}`}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold">{STAGE_LABELS[stage]}</h3>
            <p className="text-sm text-muted-foreground mt-1">{opportunities.length} oportunidades</p>
          </div>
        </div>
        <div className="mt-3 text-sm font-medium">{formatCurrency(totalValue)}</div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {opportunities.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Nenhuma oportunidade
            </div>
          ) : (
            opportunities.map(opp => (
              <PipelineCard
                key={opp.id}
                opportunity={opp}
                onClick={() => onCardClick?.(opp)}
                isSelected={selectedId === opp.id}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
