'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'

// Mock data for demonstrations
const mockMovements = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Recebimento - Fatura #001',
    client: 'Cliente A',
    supplier: '-',
    category: 'Serviços',
    type: 'ENTRADA',
    inflow: 5000,
    outflow: 0,
    balance: 45000,
    paymentMethod: 'PIX',
    status: 'CONFIRMADA',
    origin: 'Recebimento AR',
    work: 'Obra A',
    responsible: 'João Silva',
  },
  {
    id: '2',
    date: '2024-01-15',
    description: 'Pagamento - Fornecedor XYZ',
    client: '-',
    supplier: 'Fornecedor XYZ',
    category: 'Materiais',
    type: 'SAIDA',
    inflow: 0,
    outflow: 2000,
    balance: 43000,
    paymentMethod: 'Transferência',
    status: 'CONFIRMADA',
    origin: 'Pagamento AP',
    work: 'Obra B',
    responsible: 'Maria Santos',
  },
]

export default function CashFlowPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filterPeriod, setFilterPeriod] = useState('mes')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

  const filteredMovements = useMemo(() => {
    return mockMovements.filter((mov) => {
      const matchesSearch = mov.description.toLowerCase().includes(filterSearch.toLowerCase()) ||
        mov.client.toLowerCase().includes(filterSearch.toLowerCase()) ||
        mov.supplier.toLowerCase().includes(filterSearch.toLowerCase())

      const matchesStatus = !filterStatus || mov.status === filterStatus
      const matchesType = !filterType || mov.type === filterType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [filterSearch, filterStatus, filterType])

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-gray-600 mt-1">Todas as movimentações financeiras</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">Período</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="ano">Este Ano</option>
              <option value="customizado">Período Personalizado</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="PREVISTA">Prevista</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Buscar</label>
            <input
              type="text"
              placeholder="Descrição, cliente..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setFilterPeriod('mes')
                setFilterStatus('')
                setFilterType('')
                setFilterSearch('')
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Descrição</th>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Fornecedor</th>
                <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-right font-semibold">Entrada</th>
                <th className="px-4 py-3 text-right font-semibold">Saída</th>
                <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                <th className="px-4 py-3 text-left font-semibold">Forma Pgt</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Origem</th>
                <th className="px-4 py-3 text-left font-semibold">Obra</th>
                <th className="px-4 py-3 text-left font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.map((mov) => (
                <tr key={mov.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(mov.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 font-medium">{mov.description}</td>
                  <td className="px-4 py-3">{mov.client}</td>
                  <td className="px-4 py-3">{mov.supplier}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{mov.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={mov.type === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {mov.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {mov.inflow > 0 ? `R$ ${mov.inflow.toLocaleString('pt-BR')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {mov.outflow > 0 ? `R$ ${mov.outflow.toLocaleString('pt-BR')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    R$ {mov.balance.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{mov.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <Badge variant={mov.status === 'CONFIRMADA' ? 'default' : 'secondary'}>
                      {mov.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{mov.origin}</td>
                  <td className="px-4 py-3">{mov.work}</td>
                  <td className="px-4 py-3">{mov.responsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Mostrando {paginatedMovements.length} de {filteredMovements.length} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="flex gap-2">
        <Button>Conciliar Movimentações</Button>
        <Button variant="outline">Gerar Relatório</Button>
      </div>
    </div>
  )
}
