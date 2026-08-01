'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

const mockRequests = [
  {
    id: '1',
    number: 'SC-001',
    status: 'APPROVED',
    products: 3,
    total: 2450.00,
    supplier: 'Fornecedor A',
    date: '2024-01-18',
  },
  {
    id: '2',
    number: 'SC-002',
    status: 'ANALYZING',
    products: 2,
    total: 1800.00,
    supplier: '-',
    date: '2024-01-19',
  },
  {
    id: '3',
    number: 'SC-003',
    status: 'REQUESTED',
    products: 5,
    total: 4200.00,
    supplier: '-',
    date: '2024-01-20',
  },
]

const STATUS_MAP = {
  REQUESTED: 'Solicitado',
  ANALYZING: 'Em análise',
  APPROVED: 'Aprovado',
  PURCHASED: 'Comprado',
  RECEIVED: 'Recebido',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  ANALYZING: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PURCHASED: 'bg-purple-100 text-purple-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function ProcurementPage() {
  const monthSavings = 8450.00
  const activeRequests = mockRequests.filter((r) => r.status !== 'CANCELLED').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Compras Inteligentes</h1>
          <p className="text-gray-600 mt-1">Gestão inteligente de solicitações e fornecedores</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Economias Mês</div>
          <div className="text-2xl font-bold mt-2">R$ {(monthSavings / 1000).toFixed(1)}k</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Solicitações Ativas</div>
          <div className="text-2xl font-bold mt-2">{activeRequests}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Fornecedores</div>
          <div className="text-2xl font-bold mt-2">12</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Prazo Médio</div>
          <div className="text-2xl font-bold mt-2">5.2 dias</div>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Produtos</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Valor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fornecedor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {mockRequests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono font-semibold">{req.number}</td>
                  <td className="px-6 py-3">
                    <Badge className={STATUS_COLORS[req.status]}>
                      {STATUS_MAP[req.status as keyof typeof STATUS_MAP]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-center text-sm">{req.products}</td>
                  <td className="px-6 py-3 text-right font-semibold">R$ {req.total.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm">{req.supplier}</td>
                  <td className="px-6 py-3 text-sm">{req.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
