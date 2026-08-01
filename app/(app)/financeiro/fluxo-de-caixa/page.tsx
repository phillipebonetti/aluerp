'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CashFlowCards } from '@/components/financial/cash-flow-cards'
import { CashFlowTable } from '@/components/financial/cash-flow-table'
import { getCashFlow, getCashFlowSummary, reconcileMovement, deleteCashMovement } from '@/app/actions/cash-flow'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

// TODO: Get from auth context
const companyId = 'test-company-id'

export default function CashFlowPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [movements, setMovements] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('CONFIRMADA')
  const [typeFilter, setTypeFilter] = useState('')

  const pageSize = 10

  async function loadData() {
    try {
      setIsLoading(true)

      // Load summary
      const summaryData = await getCashFlowSummary(companyId)
      setSummary(summaryData)

      // Load movements
      const result = await getCashFlow(companyId, {
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: pageSize,
      })
      setMovements(result.data || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error('Error loading cash flow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, statusFilter, typeFilter])

  async function handleConfirm(id: string) {
    try {
      await reconcileMovement(companyId, id, { status: 'CONFIRMADA' })
      loadData()
    } catch (error) {
      console.error('Error confirming movement:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar esta movimentação?')) return

    try {
      await deleteCashMovement(companyId, id)
      loadData()
    } catch (error) {
      console.error('Error deleting movement:', error)
    }
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Fluxo de Caixa"
        description="Visualize entradas, saídas e saldo em tempo real"
        action={{ label: 'Nova Movimentação', href: '/financeiro/fluxo-de-caixa/novo' }}
      />

      <CashFlowCards data={summary} isLoading={isLoading} />

      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center">
          <Input placeholder="Buscar por descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 min-w-64" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="PREVISTA">Prevista</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entrada</SelectItem>
              <SelectItem value="SAIDA">Saída</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>

          <Link href="/financeiro/fluxo-de-caixa/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </Link>
        </div>

        <CashFlowTable
          data={movements}
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
          onEdit={(id) => console.log('Edit:', id)}
        />

        {total > pageSize && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
