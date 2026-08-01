'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Mail,
  Calendar,
  HardDrive,
  Banknote,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { formatDate } from '@/src/utils/format'
import { IntegrationProvider, IntegrationStatus } from '@/src/lib/integrations/types'

const PROVIDER_ICONS: Record<IntegrationProvider, React.ReactNode> = {
  [IntegrationProvider.WHATSAPP]: <MessageCircle className="w-6 h-6" />,
  [IntegrationProvider.EMAIL]: <Mail className="w-6 h-6" />,
  [IntegrationProvider.GOOGLE_CALENDAR]: <Calendar className="w-6 h-6" />,
  [IntegrationProvider.GOOGLE_DRIVE]: <HardDrive className="w-6 h-6" />,
  [IntegrationProvider.CONTA_AZUL]: <Banknote className="w-6 h-6" />,
  [IntegrationProvider.PIX_BANKING]: <Banknote className="w-6 h-6" />,
  [IntegrationProvider.BOLETO_BANKING]: <Banknote className="w-6 h-6" />,
  [IntegrationProvider.ZAPIER]: <Zap className="w-6 h-6" />,
  [IntegrationProvider.MAKE]: <Zap className="w-6 h-6" />,
  [IntegrationProvider.CUSTOM]: <Zap className="w-6 h-6" />
}

const STATUS_COLORS: Record<IntegrationStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  [IntegrationStatus.CONNECTED]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  [IntegrationStatus.DISCONNECTED]: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: <XCircle className="w-4 h-4" />
  },
  [IntegrationStatus.ERROR]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: <AlertCircle className="w-4 h-4" />
  },
  [IntegrationStatus.PENDING]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Clock className="w-4 h-4" />
  },
  [IntegrationStatus.EXPIRED]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: <AlertCircle className="w-4 h-4" />
  }
}

const STATUS_LABELS: Record<IntegrationStatus, string> = {
  [IntegrationStatus.CONNECTED]: 'Conectado',
  [IntegrationStatus.DISCONNECTED]: 'Desconectado',
  [IntegrationStatus.ERROR]: 'Erro',
  [IntegrationStatus.PENDING]: 'Pendente',
  [IntegrationStatus.EXPIRED]: 'Expirado'
}

interface IntegrationCardProps {
  id: string
  provider: IntegrationProvider
  name: string
  status: IntegrationStatus
  lastSync?: Date
  lastError?: string
  isActive: boolean
  onConfigure?: () => void
  onTest?: () => void
  onSync?: () => void
  onToggle?: () => void
  loading?: boolean
}

export function IntegrationCard({
  id,
  provider,
  name,
  status,
  lastSync,
  lastError,
  isActive,
  onConfigure,
  onTest,
  onSync,
  onToggle,
  loading = false
}: IntegrationCardProps) {
  const statusConfig = STATUS_COLORS[status]
  const statusLabel = STATUS_LABELS[status]
  const icon = PROVIDER_ICONS[provider]

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className={`${statusConfig.bg} border-b`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-gray-600">{icon}</div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">{provider}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusConfig.text}>
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusLabel}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Informações */}
        <div className="space-y-2 text-sm">
          {lastSync && (
            <div className="flex justify-between">
              <span className="text-gray-600">Última sincronização:</span>
              <span className="font-medium">{formatDate(lastSync)}</span>
            </div>
          )}
          {lastError && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <p className="text-red-700 text-xs font-medium">Erro:</p>
              <p className="text-red-600 text-xs mt-1">{lastError}</p>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={loading}
            className="text-xs"
          >
            Testar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={loading || status === IntegrationStatus.DISCONNECTED}
            className="text-xs"
          >
            Sincronizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
            disabled={loading}
            className="text-xs"
          >
            Configurar
          </Button>
          <Button
            variant={isActive ? 'destructive' : 'default'}
            size="sm"
            onClick={onToggle}
            disabled={loading}
            className="text-xs"
          >
            {isActive ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
