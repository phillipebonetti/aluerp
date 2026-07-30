'use client'

import React, { useCallback, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CRMOpportunity } from '@/src/modules/crm/types'
import { formatCurrency } from '@/lib/crm/utils'
import { GripVertical, Phone, MapPin, TrendingUp, Clock, Plus } from 'lucide-react'

interface PipelineBoardAdvancedProps {
  opportunities: CRMOpportunity[]
  onCardMove?: (cardId: string, newStage: string) => Promise<void>
  onCardClick?: (cardId: string) => void
  onAddCard?: (stage: string) => void
  loading?: boolean
}

const STAGES = [
  { id: 'NEW_LEAD', label: 'Novo Lead', color: 'bg-slate-100' },
  { id: 'FIRST_CONTACT', label: 'Primeiro Contato', color: 'bg-blue-100' },
  { id: 'VISIT_SCHEDULED', label: 'Visita Agendada', color: 'bg-cyan-100' },
  { id: 'QUOTE_SENT', label: 'Orçamento Enviado', color: 'bg-purple-100' },
  { id: 'NEGOTIATION', label: 'Negociação', color: 'bg-amber-100' },
  { id: 'CLOSED', label: 'Fechado', color: 'bg-green-100' },
  { id: 'LOST', label: 'Perdido', color: 'bg-red-100' }
]

const PROBABILITY_MAP = {
  NEW_LEAD: 10,
  FIRST_CONTACT: 20,
  VISIT_SCHEDULED: 40,
  QUOTE_SENT: 60,
  NEGOTIATION: 80,
  CLOSED: 100,
  LOST: 0
}

function ProbabilityBar({ value }: { value: number }) {
  const getColor = (val: number) => {
    if (val < 20) return 'bg-red-500'
    if (val < 40) return 'bg-orange-500'
    if (val < 60) return 'bg-yellow-500'
    if (val < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div className={`${getColor(value)} h-full`} style={{ width: `${value}%` }}></div>
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{value}%</span>
    </div>
  )
}

function OpportunityCard({ 
  opportunity, 
  onClick,
  dragging = false
}: { 
  opportunity: CRMOpportunity
  onClick?: () => void
  dragging?: boolean
}) {
  const daysParked = opportunity.lastContactAt 
    ? Math.floor((Date.now() - new Date(opportunity.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
    : '-'

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 border-gray-200 p-3 cursor-grab hover:shadow-md transition-all ${
        dragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{opportunity.leadName}</h4>
          <p className="text-xs text-gray-600">{opportunity.phone}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <MapPin className="w-3 h-3" />
          <span>{opportunity.city}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <TrendingUp className="w-3 h-3" />
          <span className="font-semibold text-green-600">{formatCurrency(opportunity.value)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <Clock className="w-3 h-3" />
          <span>Parado há {daysParked} dias</span>
        </div>
      </div>

      <ProbabilityBar value={opportunity.probability} />

      <div className="mt-2 flex gap-1">
        {opportunity.tags?.map((tag, idx) => (
          <span key={idx} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-600">{opportunity.responsible}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Phone className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export function PipelineBoardAdvanced({
  opportunities,
  onCardMove,
  onCardClick,
  onAddCard,
  loading = false
}: PipelineBoardAdvancedProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [movingCard, setMovingCard] = useState<string | null>(null)

  const getStageOpportunities = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId)
  }

  const getStageStats = (stageId: string) => {
    const stageOpps = getStageOpportunities(stageId)
    return {
      count: stageOpps.length,
      value: stageOpps.reduce((sum, opp) => sum + opp.value, 0),
      probability: stageOpps.length > 0 
        ? Math.round(stageOpps.reduce((sum, opp) => sum + opp.probability, 0) / stageOpps.length)
        : 0
    }
  }

  const handleDragEnd = useCallback(async (cardId: string, targetStage: string) => {
    if (draggedCard !== cardId) return
    
    setMovingCard(cardId)
    try {
      await onCardMove?.(cardId, targetStage)
    } finally {
      setMovingCard(null)
      setDraggedCard(null)
    }
  }, [draggedCard, onCardMove])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 min-w-min p-4">
        {STAGES.map((stage) => {
          const stats = getStageStats(stage.id)
          const stageOpps = getStageOpportunities(stage.id)

          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              {/* Header */}
              <div className={`${stage.color} rounded-t-lg p-4 border-b-2 border-gray-300`}>
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Quantidade</p>
                    <p className="font-bold text-lg">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor</p>
                    <p className="font-bold text-sm">{formatCurrency(stats.value)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Prob.</p>
                    <p className="font-bold text-lg">{stats.probability}%</p>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="bg-gray-50 rounded-b-lg min-h-96 p-3 space-y-2">
                {stageOpps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <p className="text-sm">Nenhuma oportunidade</p>
                  </div>
                ) : (
                  stageOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onClick={() => onCardClick?.(opp.id)}
                      dragging={draggedCard === opp.id}
                    />
                  ))
                )}

                {onAddCard && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onAddCard(stage.id)}
                    disabled={loading || movingCard !== null}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
