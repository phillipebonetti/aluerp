'use client'

import { AIInsight } from '@/src/lib/ai/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightsDashboardProps {
  insights: AIInsight[]
  onMarkAsRead?: (insightId: string) => void
  onFavorite?: (insightId: string) => void
}

export function InsightsDashboard({
  insights,
  onMarkAsRead,
  onFavorite
}: InsightsDashboardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'growth':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'opportunity':
        return <Lightbulb className="w-4 h-4 text-blue-600" />
      case 'anomaly':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      growth: 'Crescimento',
      warning: 'Atenção',
      opportunity: 'Oportunidade',
      anomaly: 'Anomalia'
    }
    return labels[type] || type
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sales: 'Vendas',
      financial: 'Financeiro',
      operational: 'Operacional',
      customer: 'Cliente'
    }
    return labels[category] || category
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum insight disponível no momento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {insights.map(insight => (
        <Card
          key={insight.id}
          className={cn(
            'border-l-4 cursor-pointer hover:shadow-md transition-shadow',
            getSeverityColor(insight.severity),
            insight.severity === 'critical' ? 'border-l-red-600' :
            insight.severity === 'warning' ? 'border-l-yellow-600' :
            'border-l-blue-600'
          )}
          onClick={() => onMarkAsRead?.(insight.id)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(insight.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                  {!insight.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(insight.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(insight.type)}
                  </Badge>
                  {insight.metric && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {insight.metric}
                    </span>
                  )}
                </div>

                {insight.recommendation && (
                  <div className="mt-3 p-2 bg-white/50 dark:bg-slate-900/50 rounded text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Recomendação:</span> {insight.recommendation}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
