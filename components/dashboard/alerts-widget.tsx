'use client'

import { SectionCard } from '@/components/ui'
import { AlertCircle, Info, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Alert {
  type: 'warning' | 'info' | 'alert'
  title: string
  message: string
  action: string
}

interface AlertsWidgetProps {
  alerts: Alert[]
}

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-destructive" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10 border-warning/20'
      case 'alert':
        return 'bg-destructive/10 border-destructive/20'
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  if (alerts.length === 0) {
    return (
      <SectionCard title="Alertas" description="Nenhum alerta no momento">
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Tudo está funcionando perfeitamente!</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="Alertas" description={`${alerts.length} alerta(s) pendente(s)`}>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <Link key={i} href={alert.action}>
            <div className={`border rounded-lg p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${getAlertStyle(alert.type)}`}>
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  )
}
