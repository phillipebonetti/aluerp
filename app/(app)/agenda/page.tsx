'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/page-header'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface InstallationEvent {
  id: string
  title: string
  clientName: string
  address: string
  startTime: Date
  endTime: Date
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_TRANSIT' | 'EXECUTING' | 'COMPLETED'
  team: string[]
  priority: number
}

const mockEvents: InstallationEvent[] = [
  {
    id: '1',
    title: 'Instalação - Apto 101',
    clientName: 'João Silva',
    address: 'Rua A, 100',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 12, 0),
    status: 'CONFIRMED',
    team: ['Carlos', 'Pedro'],
    priority: 5,
  },
]

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-800',
  EXECUTING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [viewType, setViewType] = useState<'month' | 'week' | 'day' | 'timeline'>('month')
  const [selectedEvent, setSelectedEvent] = useState<InstallationEvent | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const previousMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))

  const getEventsForDay = (day: Date) => {
    return mockEvents.filter((event) => isSameDay(event.startTime, day))
  }

  const checkConflicts = () => {
    const conflicts = []
    for (let i = 0; i < mockEvents.length; i++) {
      for (let j = i + 1; j < mockEvents.length; j++) {
        const e1 = mockEvents[i]
        const e2 = mockEvents[j]

        const commonTeam = e1.team.some((m) => e2.team.includes(m))
        const sameTime = e1.startTime < e2.endTime && e1.endTime > e2.startTime && isSameDay(e1.startTime, e2.startTime)

        if (commonTeam && sameTime) {
          conflicts.push({
            event1: e1.title,
            event2: e2.title,
            member: e1.team.find((m) => e2.team.includes(m)),
          })
        }
      }
    }
    return conflicts
  }

  const conflicts = checkConflicts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda de Instalações"
        description="Gerencie visitas, instalações e medições com detecção automática de conflitos"
        action={{ label: 'Novo Evento' }}
      />

      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Conflitos Detectados</h3>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {conflicts.map((c, idx) => (
                  <li key={idx}>
                    {c.member} alocado em &quot;{c.event1}&quot; e &quot;{c.event2}&quot; no mesmo horário
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        {(['month', 'week', 'day', 'timeline'] as const).map((view) => (
          <Button
            key={view}
            variant={viewType === view ? 'default' : 'outline'}
            onClick={() => setViewType(view)}
            size="sm"
          >
            {view === 'month' && 'Mês'}
            {view === 'week' && 'Semana'}
            {view === 'day' && 'Dia'}
            {view === 'timeline' && 'Timeline'}
          </Button>
        ))}
      </div>

      {viewType === 'month' && (
        <Card>
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day)
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 rounded border ${
                      isSameMonth(day, currentDate) ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`text-xs p-1 rounded cursor-pointer ${statusColors[event.status]}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Cliente</label>
                <p className="text-sm text-gray-600">{selectedEvent.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Endereço</label>
                <p className="text-sm text-gray-600">{selectedEvent.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Início</label>
                  <p className="text-sm text-gray-600">
                    {format(selectedEvent.startTime, "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Fim</label>
                  <p className="text-sm text-gray-600">
                    {format(selectedEvent.endTime, 'HH:mm')}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Equipe</label>
                <p className="text-sm text-gray-600">{selectedEvent.team.join(', ')}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Fechar
                </Button>
                <Button>Editar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
