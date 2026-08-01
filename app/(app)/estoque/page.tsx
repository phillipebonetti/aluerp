'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertTriangle } from 'lucide-react'

const mockProducts = [
  { id: '1', code: 'VIDRO-001', name: 'Vidro Temperado 6mm', current: 150, minimum: 100, cost: 45.50 },
  { id: '2', code: 'ALUM-002', name: 'Alumínio Natural 2x2', current: 45, minimum: 50, cost: 120.00 },
  { id: '3', code: 'MACAN-003', name: 'Maçaneta Cromada', current: 280, minimum: 200, cost: 15.00 },
  { id: '4', code: 'TUBO-004', name: 'Tubo Estrutural', current: 20, minimum: 30, cost: 250.00 },
  { id: '5', code: 'TINTA-005', name: 'Tinta Poliéster Cinza', current: 85, minimum: 50, cost: 85.00 },
]

export default function InventoryPage() {
  const stockValue = mockProducts.reduce((acc, p) => acc + p.current * p.cost, 0)
  const criticalProducts = mockProducts.filter((p) => p.current < p.minimum).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Estoque Inteligente</h1>
          <p className="text-gray-600 mt-1">Gestão integrada de materiais e produtos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Valor Total</div>
          <div className="text-2xl font-bold mt-2">R$ {(stockValue / 1000).toFixed(1)}k</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Produtos</div>
          <div className="text-2xl font-bold mt-2">{mockProducts.length}</div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-sm text-red-600 font-semibold">Críticos</div>
          <div className="text-2xl font-bold mt-2 text-red-700">{criticalProducts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Giro Médio</div>
          <div className="text-2xl font-bold mt-2">12.5x/ano</div>
        </Card>
      </div>

      {/* Inventory List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Código</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descrição</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Atual</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Mínimo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Custo Unit.</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => {
                const isCritical = product.current < product.minimum
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-sm font-semibold">{product.code}</td>
                    <td className="px-6 py-3 text-sm">{product.name}</td>
                    <td className="px-6 py-3 text-right font-semibold">{product.current}</td>
                    <td className="px-6 py-3 text-right text-gray-600">{product.minimum}</td>
                    <td className="px-6 py-3 text-right text-sm">R$ {product.cost.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">
                      {isCritical ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Crítico
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          OK
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
