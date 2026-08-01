'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { ServiceOrderStatus } from '@/types/os'

interface OSTableProps {
  data: any[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusConfig: Record<ServiceOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Rascunho', variant: 'outline' },
  SCHEDULED: { label: 'Agendado', variant: 'default' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'default' },
  COMPLETED: { label: 'Concluído', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  ARCHIVED: { label: 'Arquivado', variant: 'outline' },
}

const priorityConfig = {
  BAIXA: { label: 'Baixa', color: 'text-green-600' },
  NORMAL: { label: 'Normal', color: 'text-blue-600' },
  ALTA: { label: 'Alta', color: 'text-yellow-600' },
  URGENTE: { label: 'Urgente', color: 'text-red-600' },
}

export function OSTable({ data, isLoading, onView, onEdit, onDelete }: OSTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma ordem de serviço encontrada</div>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((os) => {
            const status = statusConfig[os.status as ServiceOrderStatus]
            const priority = priorityConfig[os.priority as keyof typeof priorityConfig]

            return (
              <TableRow key={os.id}>
                <TableCell className="font-medium">{os.number}</TableCell>
                <TableCell>{os.client?.name || '-'}</TableCell>
                <TableCell>{os.vendedor?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <span className={priority?.color}>{priority?.label}</span>
                </TableCell>
                <TableCell>{os.scheduledDate ? formatDate(os.scheduledDate) : '-'}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(os.totalValue)}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(os.id)}
                      >
                        Ver
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(os.id)}
                      >
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(os.id)}
                      >
                        Deletar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
