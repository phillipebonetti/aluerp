'use client'

import { useEffect, useState } from 'react'
import { getAuditHistoryAction } from '@/src/actions/audit'
import { actionLabels, getActionColor } from '@/src/lib/audit/types'
import { AuditLog } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface HistoryTabProps {
  companyId: string
  entity: string
  entityId: string
}

export function HistoryTab({ companyId, entity, entityId }: HistoryTabProps) {
  const [history, setHistory] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    loadHistory()
  }, [companyId, entity, entityId])

  const loadHistory = async () => {
    setLoading(true)
    const result = await getAuditHistoryAction(companyId, entity, entityId)
    if (result.success) {
      setHistory(result.data as AuditLog[])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum histórico disponível</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {history.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                  {actionLabels[log.action] || log.action}
                </span>
                <span className="text-sm text-gray-600">{log.userName}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(log.createdAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {log.description && <p className="text-sm text-gray-700 mt-1">{log.description}</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLog(log)}
            >
              Ver alterações
            </Button>
          </div>
        ))}
      </div>

      {selectedLog && (
        <ComparisonModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  )
}

function ComparisonModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const oldData = log.oldData ? JSON.parse(log.oldData) : {}
  const newData = log.newData ? JSON.parse(log.newData) : {}
  const changedFields = log.changedFields ? JSON.parse(log.changedFields) : []

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comparação de Alterações - {actionLabels[log.action]}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {changedFields.map((field: string) => (
            <div key={field} className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">{field}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ANTES</p>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <code className="text-sm">
                      {JSON.stringify(oldData[field], null, 2) || '(vazio)'}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">DEPOIS</p>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <code className="text-sm">
                      {JSON.stringify(newData[field], null, 2) || '(vazio)'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
