'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Clock, TrendingDown } from 'lucide-react'
import type { OSProgressData } from '@/src/types/os'

interface OsProgressBarProps {
  data: OSProgressData
  compact?: boolean
}

export function OsProgressBar({ data, compact = false }: OsProgressBarProps) {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getOverallStatusIcon = () => {
    if (data.isOverdue) {
      return <AlertCircle className="w-5 h-5 text-red-600" />
    }
    if (data.overallProgress === 100) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    return <Clock className="w-5 h-5 text-blue-600" />
  }

  const getTimeEstimate = () => {
    const daysLeft = data.remainingDays
    if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} dias atrasado`
    }
    if (daysLeft === 0) {
      return 'Hoje'
    }
    if (daysLeft === 1) {
      return '1 dia restante'
    }
    return `${daysLeft} dias restantes`
  }

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Progresso Geral</p>
              <span className="text-sm font-bold">{data.overallProgress}%</span>
            </div>
            <Progress value={data.overallProgress} className="h-2" />
          </div>
          {getOverallStatusIcon()}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getOverallStatusIcon()}
            <div>
              <h3 className="font-semibold">Progresso Geral</h3>
              <p className="text-sm text-muted-foreground">{getTimeEstimate()}</p>
            </div>
          </div>
          <span className="text-3xl font-bold">{data.overallProgress}%</span>
        </div>
        <Progress value={data.overallProgress} className="h-3" />
      </div>

      {/* Production Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Produção</label>
          <span className="text-sm font-semibold">{data.productionProgress}%</span>
        </div>
        <Progress value={data.productionProgress} className="h-2" />
      </div>

      {/* Installation Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Instalação</label>
          <span className="text-sm font-semibold">{data.installationProgress}%</span>
        </div>
        <Progress value={data.installationProgress} className="h-2" />
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Tempo Estimado</p>
          <p className="text-lg font-bold">{data.estimatedDays}d</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tempo Decorrido</p>
          <p className="text-lg font-bold text-blue-600">{data.elapsedDays}d</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tempo Restante</p>
          <p className={`text-lg font-bold ${data.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
            {data.remainingDays > 0 ? `${data.remainingDays}d` : '0d'}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {data.isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Esta OS está atrasada</p>
            <p className="text-xs text-red-700">Ações imediatas podem ser necessárias</p>
          </div>
        </div>
      )}
    </Card>
  )
}
