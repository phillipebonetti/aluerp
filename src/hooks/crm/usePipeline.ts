'use client'

import { useMemo } from 'react'
import type { CRMOpportunity } from '@/src/modules/crm/types'
import { aggregatePipelineByStage, calculateConversionByStage } from '@/lib/crm/utils'

export function usePipeline(opportunities: CRMOpportunity[]) {
  const stages = useMemo(() => aggregatePipelineByStage(opportunities), [opportunities])
  
  const conversion = useMemo(() => calculateConversionByStage(opportunities), [opportunities])
  
  const totalValue = useMemo(() => stages.reduce((sum, s) => sum + s.totalValue, 0), [stages])
  
  const totalCount = useMemo(() => stages.reduce((sum, s) => sum + s.count, 0), [stages])

  return {
    stages,
    conversion,
    totalValue,
    totalCount,
    isEmpty: totalCount === 0
  }
}
