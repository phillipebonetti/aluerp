'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { OSCommission, CommissionStatus } from '@/src/types/os'

interface OsCommissionTabProps {
  serviceOrderId: string
  commissions: OSCommission[]
  osValue: number
  isLoading?: boolean
  onApprove?: (commissionId: string) => void
  onPay?: (commissionId: string) => void
}

const STATUS_CONFIG: Record<CommissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-4 h-4" />,
  },
  APPROVED: {
    label: 'Aprovada',
    color: 'bg-blue-100 text-blue-800',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  PAID: {
    label: 'Paga',
    color: 'bg-green-100 text-green-800',
    icon: <DollarSign className="w-4 h-4" />,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-gray-100 text-gray-800',
    icon: <AlertCircle className="w-4 h-4" />,
  },
}

export function OsCommissionTab({
  serviceOrderId,
  commissions = [],
  osValue,
  isLoading = false,
  onApprove,
  onPay,
}: OsCommissionTabProps) {
  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionValue, 0)
  const approvedCount = commissions.filter((c) => c.status === 'APPROVED').length
  const paidCount = commissions.filter((c) => c.status === 'PAID').length

  const commissionPercentage = osValue > 0 ? ((totalCommission / osValue) * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Valor da OS</p>
          <p className="text-2xl font-bold">R$ {osValue.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Comissão</p>
          <p className="text-2xl font-bold text-orange-600">R$ {totalCommission.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{commissionPercentage}% do valor</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Aprovadas</p>
          <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pagas</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </Card>
      </div>

      {/* Commissions Table */}
      {commissions.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Taxa (%)</TableHead>
                <TableHead className="text-right">Valor OS Base</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aprovado em</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.vendedor?.name || 'Sem nome'}</TableCell>
                  <TableCell className="text-right">{commission.commissionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">R$ {commission.osValue.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold text-orange-600">
                    R$ {commission.commissionValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_CONFIG[commission.status].color}>
                      <span className="mr-1">{STATUS_CONFIG[commission.status].icon}</span>
                      {STATUS_CONFIG[commission.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {commission.approvedAt
                      ? new Date(commission.approvedAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {commission.paidAt ? new Date(commission.paidAt).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {commission.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApprove?.(commission.id)}
                          disabled={isLoading}
                        >
                          Aprovar
                        </Button>
                      )}
                      {commission.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPay?.(commission.id)}
                          disabled={isLoading}
                        >
                          Marcar Pago
                        </Button>
                      )}
                      {commission.status === 'PAID' && (
                        <Badge variant="secondary">Concluído</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma comissão registrada</p>
        </Card>
      )}

      {/* Commission Rules */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Regras de Comissão</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Comissão é calculada automaticamente baseada na taxa do vendedor</li>
          <li>• Status: Pendente → Aprovada → Paga</li>
          <li>• Apenas comissões aprovadas podem ser marcadas como pagas</li>
          <li>• Histórico completo de transações é mantido</li>
        </ul>
      </Card>
    </div>
  )
}
