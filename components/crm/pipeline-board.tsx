'use client'

import { useMemo, useState } from 'react'
import { PipelineColumn } from './pipeline-column'
import { PIPELINE_STAGES } from '@/lib/crm/utils'
import type { CRMOpportunity } from '@/src/modules/crm/types'

interface PipelineBoardProps {
  opportunities: CRMOpportunity[]
  onCardClick?: (opportunity: CRMOpportunity) => void
}

export function PipelineBoard({ opportunities, onCardClick }: PipelineBoardProps) {
  const [selectedId, setSelectedId] = useState<string>()

  const groupedByStage = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = opportunities.filter(opp => opp.stage === stage)
      return acc
    }, {} as Record<CRMOpportunity['stage'], CRMOpportunity[]>)
  }, [opportunities])

  const handleCardClick = (opportunity: CRMOpportunity) => {
    setSelectedId(opportunity.id)
    onCardClick?.(opportunity)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map(stage => (
        <div key={stage} className="flex-shrink-0 w-80">
          <PipelineColumn
            stage={stage}
            opportunities={groupedByStage[stage]}
            onCardClick={handleCardClick}
            selectedId={selectedId}
          />
        </div>
      ))}
    </div>
  )
}
