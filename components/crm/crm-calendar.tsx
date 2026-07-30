'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Phone, Video, Mail, MapPin, Users, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  type: 'meeting' | 'call' | 'email' | 'visit' | 'reminder'
  date: Date
  startTime: string
  endTime: string
  attendees?: string[]
  location?: string
  leadName?: string
  description?: string
}

interface CRMCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (eventId: string) => void
  onDateClick?: (date: Date) => void
}

export function CRMCalendar({ events = [], onEventClick, onDateClick }: CRMCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventIcon = (type: CalendarEvent['type']) => {
    const iconProps = { className: 'w-4 h-4' }
    switch (type) {
      case 'meeting':
        return <Users {...iconProps} />
      case 'call':
        return <Phone {...iconProps} />
      case 'email':
        return <Mail {...iconProps} />
      case 'visit':
        return <MapPin {...iconProps} />
      case 'reminder':
        return <AlertCircle {...iconProps} />
      default:
        return null
    }
  }

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'call':
        return 'bg-green-100 text-green-800'
      case 'email':
        return 'bg-purple-100 text-purple-800'
      case 'visit':
        return 'bg-orange-100 text-orange-800'
      case 'reminder':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(
      event =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    )
  }

  const monthDays = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

  const days = []
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(null)
  }
  for (let i = 1; i <= monthDays; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* View Type Tabs */}
        <Tabs value={viewType} onValueChange={(v: any) => setViewType(v)}>
          <TabsList>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="day">Dia</TabsTrigger>
          </TabsList>

          {/* Month View */}
          <TabsContent value="month" className="mt-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isCurrentMonth = day !== null
                const date = isCurrentMonth
                  ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  : new Date()
                const dayEvents = isCurrentMonth ? getEventsForDate(date) : []
                const isToday =
                  isCurrentMonth &&
                  date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={idx}
                    onClick={() => isCurrentMonth && onDateClick?.(date)}
                    className={`min-h-24 p-2 border rounded-lg cursor-pointer transition ${
                      isCurrentMonth
                        ? isToday
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white hover:bg-gray-50'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {day}
                    </p>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event.id)}
                          className={`text-xs p-1 rounded truncate ${getEventColor(event.type)} flex items-center gap-1`}
                        >
                          {getEventIcon(event.type)}
                          <span>{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-gray-600 px-1">+{dayEvents.length - 2} mais</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Week View */}
          <TabsContent value="week" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Semana de {new Date(currentDate).toLocaleDateString('pt-BR')}</p>
              {events.slice(0, 5).map(event => (
                <Card key={event.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {event.startTime} - {event.endTime}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge>{event.type}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Day View */}
          <TabsContent value="day" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <div className="space-y-2">
                {events.filter(e => e.date.toDateString() === currentDate.toDateString()).map(event => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <p className="font-semibold text-lg">{event.startTime}</p>
                        <p className="text-xs text-gray-600">{event.endTime}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                        {event.location && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                        {event.attendees && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.attendees.join(', ')}
                          </p>
                        )}
                      </div>
                      <Badge>{event.type}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Próximos Eventos</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.slice(0, 5).map(event => (
            <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className={`p-2 rounded ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-600">
                  {event.date.toLocaleDateString('pt-BR')} às {event.startTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
