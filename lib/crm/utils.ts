// CRM Utility Functions
import type { CRMOpportunity, PipelineStageData, ConversionData, FunnelData } from '@/src/modules/crm/types'

export const PIPELINE_STAGES: CRMOpportunity['stage'][] = [
  'prospecção',
  'qualificação',
  'proposta',
  'negociação',
  'fechamento'
]

export const STAGE_LABELS: Record<CRMOpportunity['stage'], string> = {
  'prospecção': 'Prospecção',
  'qualificação': 'Qualificação',
  'proposta': 'Proposta',
  'negociação': 'Negociação',
  'fechamento': 'Fechamento'
}

export const STAGE_COLORS: Record<CRMOpportunity['stage'], string> = {
  'prospecção': 'bg-blue-100 text-blue-800',
  'qualificação': 'bg-purple-100 text-purple-800',
  'proposta': 'bg-yellow-100 text-yellow-800',
  'negociação': 'bg-orange-100 text-orange-800',
  'fechamento': 'bg-green-100 text-green-800'
}

export function calculateConversionRate(total: number, converted: number): number {
  if (total === 0) return 0
  return Math.round((converted / total) * 100)
}

export function calculateAverageDealValue(opportunities: CRMOpportunity[]): number {
  if (opportunities.length === 0) return 0
  const total = opportunities.reduce((sum, opp) => sum + opp.value, 0)
  return Math.round(total / opportunities.length)
}

export function aggregatePipelineByStage(opportunities: CRMOpportunity[]): PipelineStageData[] {
  const grouped = PIPELINE_STAGES.map(stage => ({
    stage,
    opportunities: opportunities.filter(opp => opp.stage === stage)
  }))

  return grouped.map(({ stage, opportunities }) => ({
    stage,
    count: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    avgProbability: opportunities.length > 0 
      ? Math.round(opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length)
      : 0
  }))
}

export function calculateConversionByStage(opportunities: CRMOpportunity[]): ConversionData[] {
  return PIPELINE_STAGES.map(stage => {
    const stageOpps = opportunities.filter(opp => opp.stage === stage)
    const convertedCount = stageOpps.filter(opp => opp.probability >= 80).length
    
    return {
      stage,
      count: stageOpps.length,
      converted: convertedCount,
      rate: calculateConversionRate(stageOpps.length, convertedCount)
    }
  })
}

export function generateFunnelData(opportunities: CRMOpportunity[]): FunnelData[] {
  const total = opportunities.length
  const pipeline = aggregatePipelineByStage(opportunities)
  
  return pipeline.map(item => ({
    stage: STAGE_LABELS[item.stage],
    count: item.count,
    value: item.totalValue,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function getDaysUntilDeadline(date: Date): number {
  const today = new Date()
  const deadline = new Date(date)
  const diff = deadline.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getDeadlineStatus(daysRemaining: number): 'urgent' | 'warning' | 'ok' {
  if (daysRemaining <= 3) return 'urgent'
  if (daysRemaining <= 7) return 'warning'
  return 'ok'
}

export function priorityScore(opportunity: CRMOpportunity): number {
  const probability = opportunity.probability / 100
  const daysUntil = getDaysUntilDeadline(opportunity.expectedCloseDate)
  const urgency = Math.max(0, 1 - daysUntil / 30)
  
  return Math.round((probability * 0.6 + urgency * 0.4) * 100)
}
