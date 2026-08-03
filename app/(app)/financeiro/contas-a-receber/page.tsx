'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listReceivables, getReceivableSummary } from '@/app/actions/accounts-receivable'
import { formatCurrency, formatDate } from '@/src/lib/utils'
import { Plus, Download } from 'lucide-react'

export default function AccountsReceivablePage() {
  const [receivables, setReceivables] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: '',
    clientId: '',
    search: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [receivablesData, summaryData] = await Promise.all([
          listReceivables('company-id', {
            status: filters.status || undefined,
            clientId: filters.clientId || undefined,
          }),
          getReceivableSummary('company-id'),
        ])
        setReceivables(receivablesData || [])
        setSummary(summaryData)
      } catch (error) {
        console.error('Error loading AR data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ABERTO: 'bg-blue-100 text-blue-800',
      PARCIALMENTE_RECEBIDO: 'bg-yellow-100 text-yellow-800',
      RECEBIDO: 'bg-green-100 text-green-800',
      VENCIDO: 'bg-red-100 text-red-800',
      CANCELADO: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas a Receber</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalReceivable || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recebido no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.receivedThisMonth || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary?.openAmount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vencido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.overdueAmount || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <Input
            placeholder="Buscar por cliente, documento..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="ABERTO">Em Aberto</SelectItem>
            <SelectItem value="PARCIALMENTE_RECEBIDO">Parcialmente Recebido</SelectItem>
            <SelectItem value="RECEBIDO">Recebido</SelectItem>
            <SelectItem value="VENCIDO">Vencido</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Ordem de Serviço</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Recebido</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : receivables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Nenhuma conta a receber encontrada
                </TableCell>
              </TableRow>
            ) : (
              receivables.map((ar) => (
                <TableRow key={ar.id}>
                  <TableCell className="font-medium">{ar.client?.name}</TableCell>
                  <TableCell>{ar.documentNumber}</TableCell>
                  <TableCell>{ar.serviceOrder?.number || '-'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ar.totalValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ar.receivedValue)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(ar.finalBalance)}</TableCell>
                  <TableCell>{formatDate(ar.dueDate)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ar.status)}>{ar.status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
