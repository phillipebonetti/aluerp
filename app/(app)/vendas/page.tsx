'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Phone, MapPin } from 'lucide-react'

const STAGES = ['Lead', 'Primeiro Contato', 'Visita', 'Orçamento', 'Negociação', 'Fechado']

const mockLeads = [
  { id: '1', name: 'João Silva', company: 'Silva Construções', stage: 2, phone: '11 98765-4321', value: 15000, salesman: 'Carlos' },
  { id: '2', name: 'Maria Santos', company: 'M&S Arquitetura', stage: 0, phone: '11 99876-5432', value: 8000, salesman: 'Ana' },
  { id: '3', name: 'Pedro Costa', company: 'Costa Inc', stage: 4, phone: '11 97654-3210', value: 25000, salesman: 'Carlos' },
  { id: '4', name: 'Ana Oliveira', company: 'Oliveira Ltd', stage: 1, phone: '11 96543-2109', value: 12000, salesman: 'Roberto' },
  { id: '5', name: 'Roberto Alves', company: 'Alves Construtor', stage: 3, phone: '11 95432-1098', value: 18000, salesman: 'Ana' },
]

export default function CommercialCRMPage() {
  const conversionRate = 28.5
  const avgTicket = 15600
  const totalPipeline = mockLeads.reduce((acc, l) => acc + l.value, 0)

  const groupedByStage = STAGES.map((stage, idx) =>
    mockLeads.filter((l) => l.stage === idx)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Vendas - CRM</h1>
          <p className="text-gray-600 mt-1">Pipeline de vendas e gestão de leads</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Funil Total</div>
          <div className="text-2xl font-bold mt-2">R$ {(totalPipeline / 1000).toFixed(0)}k</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Taxa Conversão</div>
          <div className="text-2xl font-bold mt-2">{conversionRate}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Ticket Médio</div>
          <div className="text-2xl font-bold mt-2">R$ {(avgTicket / 1000).toFixed(0)}k</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Leads Ativos</div>
          <div className="text-2xl font-bold mt-2">{mockLeads.length}</div>
        </Card>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAGES.map((stage, idx) => (
          <Card key={idx} className="p-4 bg-gray-50">
            <div className="mb-4">
              <h3 className="font-semibold text-sm">{stage}</h3>
              <p className="text-xs text-gray-600">{groupedByStage[idx].length} leads</p>
            </div>

            <div className="space-y-3">
              {groupedByStage[idx].map((lead) => (
                <Card key={lead.id} className="p-3 bg-white cursor-move hover:shadow-md transition">
                  <div className="font-semibold text-sm mb-2">{lead.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{lead.company}</div>
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">R$ {(lead.value / 1000).toFixed(0)}k</Badge>
                    <span className="text-xs text-gray-600">{lead.salesman}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Conversion Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Funil de Conversão</h3>
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const count = groupedByStage[idx].length
            const percentage = (count / mockLeads.length) * 100
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stage}</span>
                  <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
