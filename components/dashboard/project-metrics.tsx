'use client'

import { SectionCard } from '@/components/ui'
import { CheckCircle, Clock, BarChart3 } from 'lucide-react'

interface ProjectMetricsData {
  total: number
  active: number
  completed: number
  completionRate: number | string
}

interface ProjectMetricsProps {
  metrics: ProjectMetricsData
}

export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  return (
    <SectionCard title="Métricas de Projetos" description="Status dos projetos da empresa">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-foreground" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          </div>
          <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ativos</p>
          </div>
          <p className="text-2xl font-semibold text-accent">{metrics.active}</p>
        </div>

        <div className="bg-success/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Concluídos</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-success">{metrics.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.completionRate}% de conclusão</p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
