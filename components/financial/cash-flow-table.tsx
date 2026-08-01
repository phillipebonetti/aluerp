'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, CheckCircle2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CashMovement } from '@/src/types/financial'

interface CashFlowTableProps {
  data: any[]
  isLoading: boolean
  onConfirm?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function CashFlowTable({ data, isLoading, onConfirm, onDelete, onEdit }: CashFlowTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800'
      case 'PREVISTA':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELADA':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return 'text-green-600'
      case 'SAIDA':
        return 'text-red-600'
      case 'TRANSFERENCIA':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ENTRADA: 'Entrada',
      SAIDA: 'Saída',
      TRANSFERENCIA: 'Transferência',
      AJUSTE: 'Ajuste',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</div>
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((movement: any) => (
            <TableRow key={movement.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-sm">
                {new Date(movement.movementDate).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{movement.description}</TableCell>
              <TableCell className="text-sm">{movement.account?.name}</TableCell>
              <TableCell className="text-sm">{movement.category?.name || '-'}</TableCell>
              <TableCell>
                <span className={`font-semibold ${getTypeColor(movement.type)}`}>
                  {getTypeLabel(movement.type)}
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span className={getTypeColor(movement.type)}>
                  {movement.type === 'ENTRADA' ? '+' : '-'} R$ {movement.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(movement.status)}>{movement.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {movement.status === 'PREVISTA' && onConfirm && (
                      <DropdownMenuItem onClick={() => onConfirm(movement.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(movement.id)}>
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(movement.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
