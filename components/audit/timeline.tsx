'use client'

import { useEffect, useState } from 'react'
import { getAuditTimelineAction } from '@/src/actions/audit'
import { actionLabels, getActionColor } from '@/src/lib/audit/types'
import { Skeleton } from '@/components/ui/skeleton'

interface TimelineProps {
  companyId: string
  entity: string
  entityId: string
}

interface TimelineItem {
  id: string
  createdAt: Date
  action: string
  userName: string
  description?: string
  changedFields: string[]
}

export function Timeline({ companyId, entity, entityId }: TimelineProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [companyId, entity, entityId])

  const loadTimeline = async () => {
    setLoading(true)
    const result = await getAuditTimelineAction(companyId, entity, entityId)
    if (result.success) {
      setTimeline(result.data as TimelineItem[])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum evento no histórico</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1
        const date = new Date(item.createdAt)
        const formattedDate = date.toLocaleDateString('pt-BR')

        return (
          <div key={item.id} className="flex gap-4 pb-6 relative">
            {/* Timeline connector */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Timeline dot */}
            <div className="flex-shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getActionColor(item.action as any).split(' ')[0]}`}>
                {getActionColor(item.action as any).includes('green')
                  ? '✓'
                  : getActionColor(item.action as any).includes('red')
                  ? '✕'
                  : getActionColor(item.action as any).includes('blue')
                  ? '✏'
                  : '○'}
              </div>
            </div>

            {/* Timeline content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{formattedDate}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(item.action as any)}`}>
                      {actionLabels[item.action as any] || item.action}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Por {item.userName}</p>
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                  )}
                  {item.changedFields && item.changedFields.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium">Campos alterados:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.changedFields.map((field) => (
                          <span key={field} className="bg-gray-100 px-2 py-0.5 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
