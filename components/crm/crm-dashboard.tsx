'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { CRMStatsCards, ConversionChart, FunnelChart, PipelineBoard } from '@/components/crm'
import { usePipeline } from '@/src/hooks/crm/usePipeline'
import { aggregatePipelineByStage, calculateConversionByStage, generateFunnelData } from '@/lib/crm/utils'
import type { CRMOpportunity, CRMStats } from '@/src/modules/crm/types'

interface CRMDashboardProps {
  opportunities: CRMOpportunity[]
  leads: any[]
}

export function CRMDashboard({ opportunities, leads }: CRMDashboardProps) {
  const { stages, totalValue, totalCount } = usePipeline(opportunities)
  
  const conversionData = useMemo(() => calculateConversionByStage(opportunities), [opportunities])
  const funnelData = useMemo(() => generateFunnelData(opportunities), [opportunities])
  
  const stats: CRMStats = useMemo(() => ({
    totalLeads: leads.length,
    totalOpportunities: opportunities.length,
    pipelineValue: totalValue,
    conversionRate: opportunities.length > 0 
      ? Math.round((opportunities.filter(o => o.probability >= 50).length / opportunities.length) * 100)
      : 0,
    avgDealValue: opportunities.length > 0 
      ? Math.round(totalValue / opportunities.length)
      : 0,
    closedDeals: opportunities.filter(o => o.stage === 'fechamento').length,
    lostDeals: 0,
    activeTasks: 5
  }), [opportunities, leads, totalValue, totalCount])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <CRMStatsCards stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversionChart data={conversionData} />
        <FunnelChart data={funnelData} />
      </div>

      {/* Pipeline Board */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pipeline Visual</h2>
        <PipelineBoard opportunities={opportunities} />
      </Card>

      {/* Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resumo por Estágio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map(stage => (
            <div key={stage.stage} className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{stage.count}</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{stage.stage}</div>
              <div className="text-sm font-semibold mt-2">
                R$ {(stage.totalValue / 1000).toFixed(0)}k
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
