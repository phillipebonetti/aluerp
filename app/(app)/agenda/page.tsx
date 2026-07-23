import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarDays } from 'lucide-react'

export default function AgendaPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Agenda"
        description="Organize visitas técnicas, instalações e reuniões com clientes."
        action={{ label: 'Novo Evento' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento agendado"
          description="Agende visitas técnicas, medições, instalações e acompanhe sua agenda semanal."
          action={{ label: 'Agendar Evento' }}
        />
      </div>
    </div>
  )
}
