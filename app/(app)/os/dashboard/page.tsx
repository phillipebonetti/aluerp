'use client'

import { Suspense, useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { OSDashboardKPIs, OSDashboardFinancialMetrics } from '@/components/os/os-dashboard-kpis'
import {
  OSDashboardStatusChart,
  OSDashboardPriorityChart,
  OSDashboardVendorChart,
  OSDashboardTimelineChart,
} from '@/components/os/os-dashboard-charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { OSDashboardMetrics } from '@/src/types/os'
import { AlertCircle } from 'lucide-react'

// TODO: Get from auth context
const companyId = 'test-company-id'

async function fetchDashboardData() {
  try {
    const [metrics, status, priority, vendors, timeline, overdue] = await Promise.all([
      fetch(`/api/os/dashboard/metrics?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/os/dashboard/status?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/os/dashboard/priority?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/os/dashboard/vendors?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/os/dashboard/timeline?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/os/dashboard/overdue?companyId=${companyId}`).then((r) => r.json()),
    ])

    return { metrics, status, priority, vendors, timeline, overdue }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'IN_PROGRESS':
      return 'secondary'
    case 'DRAFT':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    SCHEDULED: 'Agendado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    ARCHIVED: 'Arquivado',
  }
  return labels[status] || status
}

export default function OSDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData().then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Dashboard - Ordem de Serviço"
        description="Visão geral do módulo de Ordem de Serviço com KPIs, gráficos e alertas."
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="flex gap-3 items-center py-8">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <OSDashboardKPIs metrics={data.metrics} />

          {/* Financial Metrics */}
          <OSDashboardFinancialMetrics metrics={data.metrics} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.status && <OSDashboardStatusChart data={data.status} />}
            {data.priority && <OSDashboardPriorityChart data={data.priority} />}
            {data.vendors && <OSDashboardVendorChart data={data.vendors} />}
            {data.timeline && <OSDashboardTimelineChart data={data.timeline} />}
          </div>

          {/* Overdue OS Section */}
          {data.overdue && data.overdue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Ordens Atrasadas ({data.overdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.overdue.map((os: any) => (
                    <div key={os.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex-1">
                        <p className="font-medium">OS #{os.number}</p>
                        <p className="text-sm text-muted-foreground">{os.client?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(os.priority || 'NORMAL')}>
                          {os.priority || 'NORMAL'}
                        </Badge>
                        <span className="text-sm text-muted-foreground min-w-24 text-right">
                          {os.scheduledDate && new Date(os.scheduledDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
