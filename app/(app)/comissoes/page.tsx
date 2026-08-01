'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDate, formatCurrency } from '@/src/lib/utils'
import { Search, CheckCircle, DollarSign, RotateCcw } from 'lucide-react'

// TODO: Get from auth context and server actions
const companyId = 'test-company-id'

interface CommissionItem {
  id: string
  vendedorName: string
  clientName: string
  obraName: string
  osNumber: string
  osValue: number
  percentage: number
  commissionValue: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  dueDate?: Date
  paidDate?: Date
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  PAID: 'Paga',
  CANCELLED: 'Cancelada',
}

export default function ComissoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<CommissionItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedCommission, setSelectedCommission] = useState<CommissionItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'pay' | 'reverse' | null>(null)

  useEffect(() => {
    // TODO: Load from server actions
    setIsLoading(false)
    // Mock data
    setData([
      {
        id: '1',
        vendedorName: 'João Silva',
        clientName: 'Empresa ABC',
        obraName: 'Obra Centro',
        osNumber: 'OS-001',
        osValue: 15000,
        percentage: 5,
        commissionValue: 750,
        status: 'PENDING',
      },
      {
        id: '2',
        vendedorName: 'Maria Santos',
        clientName: 'Indústria XYZ',
        obraName: 'Fábrica Nova',
        osNumber: 'OS-002',
        osValue: 28000,
        percentage: 5,
        commissionValue: 1400,
        status: 'APPROVED',
      },
      {
        id: '3',
        vendedorName: 'Pedro Oliveira',
        clientName: 'Comércio 123',
        obraName: 'Loja Centro',
        osNumber: 'OS-003',
        osValue: 12000,
        percentage: 5,
        commissionValue: 600,
        status: 'PAID',
        paidDate: new Date(),
      },
    ])
  }, [])

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.vendedorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.osNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = !statusFilter || item.status === statusFilter

    return matchSearch && matchStatus
  })

  async function handleAction(commission: CommissionItem, action: 'approve' | 'pay' | 'reverse') {
    setSelectedCommission(commission)
    setActionType(action)
    setDialogOpen(true)
  }

  async function confirmAction() {
    if (!selectedCommission || !actionType) return

    // TODO: Call server action based on actionType
    console.log(`Executing ${actionType} on commission ${selectedCommission.id}`)

    // Update local state for demo
    const updated = data.map((item) =>
      item.id === selectedCommission.id
        ? {
            ...item,
            status: actionType === 'approve' ? 'APPROVED' : actionType === 'pay' ? 'PAID' : item.status,
            paidDate: actionType === 'pay' ? new Date() : item.paidDate,
          }
        : item
    )
    setData(updated)
    setDialogOpen(false)
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Gestão de Comissões"
        description="Acompanhe, aprove e pague comissões de vendedores"
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-64 flex gap-2">
          <Input
            placeholder="Buscar por vendedor, cliente ou OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="APPROVED">Aprovada</SelectItem>
            <SelectItem value="PAID">Paga</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>OS</TableHead>
              <TableHead className="text-right">Valor OS</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.vendedorName}</TableCell>
                <TableCell>{item.clientName}</TableCell>
                <TableCell>{item.obraName}</TableCell>
                <TableCell className="font-mono">{item.osNumber}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.osValue)}</TableCell>
                <TableCell className="text-right">{item.percentage}%</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(item.commissionValue)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {item.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(item, 'approve')}
                      className="text-blue-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  {item.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(item, 'pay')}
                      className="text-green-600"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Pagar
                    </Button>
                  )}
                  {item.status === 'PAID' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(item, 'reverse')}
                      className="text-red-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Estornar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Deseja aprovar esta comissão para pagamento?'}
              {actionType === 'pay' && 'Deseja marcar esta comissão como paga?'}
              {actionType === 'reverse' && 'Deseja estornar o pagamento desta comissão?'}
            </DialogDescription>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-semibold">Vendedor:</span> {selectedCommission.vendedorName}
                </p>
                <p>
                  <span className="font-semibold">Comissão:</span> {formatCurrency(selectedCommission.commissionValue)}
                </p>
                <p>
                  <span className="font-semibold">Status atual:</span> {statusLabels[selectedCommission.status]}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={confirmAction} variant="default">
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
