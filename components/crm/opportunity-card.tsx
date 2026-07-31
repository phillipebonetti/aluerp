'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

interface OpportunityCardProps {
  id: string
  leadName: string
  value: number
  probability: number
  stage: string
  responsible?: { name: string }
  expectedCloseDate?: Date
}

export function OpportunityCard({ id, leadName, value, probability, stage, responsible, expectedCloseDate }: OpportunityCardProps) {
  const stageColors: Record<string, string> = {
    NEW_LEAD: 'bg-blue-100 text-blue-800',
    CONTACT_MADE: 'bg-yellow-100 text-yellow-800',
    VISIT_SCHEDULED: 'bg-purple-100 text-purple-800',
    MEASUREMENT: 'bg-indigo-100 text-indigo-800',
    QUOTED: 'bg-orange-100 text-orange-800',
    NEGOTIATING: 'bg-rose-100 text-rose-800',
    CLOSED_WON: 'bg-green-100 text-green-800',
    CLOSED_LOST: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{leadName}</CardTitle>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{probability}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">R$ {(value * probability / 100).toLocaleString('pt-BR')}</span>
          <Badge className={stageColors[stage] || 'bg-gray-100'}>{stage.replace(/_/g, ' ')}</Badge>
        </div>
        {expectedCloseDate && (
          <p className="text-xs text-gray-600">Previsão: {new Date(expectedCloseDate).toLocaleDateString('pt-BR')}</p>
        )}
      </CardContent>
    </Card>
  )
}
