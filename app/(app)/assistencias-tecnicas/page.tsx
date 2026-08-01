'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, AlertCircle } from 'lucide-react'

const STATUSES = {
  OPEN: 'Aberto',
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Atendimento',
  WAITING_PARTS: 'Aguardando Peças',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  WAITING_PARTS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

const PRIORITIES = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-50 text-blue-700',
  NORMAL: 'bg-green-50 text-green-700',
  HIGH: 'bg-yellow-50 text-yellow-700',
  CRITICAL: 'bg-red-50 text-red-700',
}

// Mock data
const mockTickets = [
  {
    id: '1',
    ticketNumber: 'AT-001',
    title: 'Problema na vedação da janela',
    client: 'João Silva',
    work: 'Obra Residencial Centro',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    technician: 'Carlos Técnico',
    openedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    ticketNumber: 'AT-002',
    title: 'Pintura com defeito',
    client: 'Maria Santos',
    work: 'Condomínio norte',
    priority: 'NORMAL',
    status: 'OPEN',
    technician: 'Disponível',
    openedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    ticketNumber: 'AT-003',
    title: 'Ferramenta emperrada',
    client: 'Pedro Costa',
    work: 'Shopping Vila Nova',
    priority: 'CRITICAL',
    status: 'SCHEDULED',
    technician: 'Roberto',
    openedAt: new Date('2024-01-19'),
  },
]

export default function SupportTicketsPage() {
  const [tickets] = useState(mockTickets)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(filter.toLowerCase()) ||
      t.title.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = !statusFilter || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openTickets = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Assistências Técnicas</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de chamados técnicos e garantias</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Chamados Abertos</div>
          <div className="text-3xl font-bold mt-2">{openTickets}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Em Atendimento</div>
          <div className="text-3xl font-bold mt-2">{inProgressTickets}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tempo Médio</div>
          <div className="text-3xl font-bold mt-2">2.5d</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Satisfação</div>
          <div className="text-3xl font-bold mt-2">94%</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por número ou assunto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              {Object.entries(STATUSES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Abertura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ticket) => (
              <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-mono font-semibold">{ticket.ticketNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                <TableCell className="text-sm">{ticket.client}</TableCell>
                <TableCell>
                  <Badge className={PRIORITY_COLORS[ticket.priority]}>
                    {PRIORITIES[ticket.priority as keyof typeof PRIORITIES]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[ticket.status]}>
                    {STATUSES[ticket.status as keyof typeof STATUSES]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{ticket.technician}</TableCell>
                <TableCell className="text-sm">
                  {ticket.openedAt.toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
