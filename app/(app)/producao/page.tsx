'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp } from 'lucide-react'

const STAGES = ['Projeto', 'Corte', 'Usinagem', 'Montagem', 'Pintura', 'Vidros', 'Conferência', 'Embalagem', 'Pronto']

const mockOrders = [
  {
    id: '1',
    number: 'OP-001',
    work: 'Residencial Centro',
    client: 'João Silva',
    stage: 4,
    priority: 'HIGH',
    progress: 44,
  },
  {
    id: '2',
    number: 'OP-002',
    work: 'Condomínio Norte',
    client: 'Maria Santos',
    stage: 2,
    priority: 'NORMAL',
    progress: 22,
  },
  {
    id: '3',
    number: 'OP-003',
    work: 'Shopping Vila Nova',
    client: 'Pedro Costa',
    stage: 8,
    priority: 'LOW',
    progress: 89,
  },
]

export default function ProductionPage() {
  const avgEfficiency = 87
  const rework = 3
  const dailyProduction = 12

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Controle de Produção</h1>
          <p className="text-gray-600 mt-1">Acompanhe o status de todas as ordens de produção</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova OP
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Produção Diária</div>
          <div className="text-3xl font-bold mt-2">{dailyProduction}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Eficiência</div>
          <div className="text-3xl font-bold mt-2">{avgEfficiency}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Retrabalho</div>
          <div className="text-3xl font-bold mt-2">{rework}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Em Produção</div>
          <div className="text-3xl font-bold mt-2">{mockOrders.length}</div>
        </Card>
      </div>

      {/* Production Orders */}
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-mono font-bold text-lg">{order.number}</div>
                <div className="text-sm text-gray-600">{order.work}</div>
              </div>
              <Badge variant={order.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                {order.priority}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-2">
                  {STAGES[order.stage]} ({order.progress}%)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${
                      idx <= order.stage
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
