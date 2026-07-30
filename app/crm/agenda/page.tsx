import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReminderCard } from '@/components/crm'
import { getCurrentUser } from '@/src/core/auth'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'

// Mock reminders data
const mockReminders = [
  {
    id: '1',
    title: 'Ligar para João Silva',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'alta' as const,
    status: 'pendente' as const
  },
  {
    id: '2',
    title: 'Enviar proposta para Maria Santos',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'média' as const,
    status: 'pendente' as const
  },
  {
    id: '3',
    title: 'Reunião com client Tech Corp',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    priority: 'alta' as const,
    status: 'pendente' as const
  }
]

export default async function AgendaPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus compromissos e lembretes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      <div className="space-y-3">
        {mockReminders.map(reminder => (
          <ReminderCard
            key={reminder.id}
            title={reminder.title}
            dueDate={reminder.dueDate}
            priority={reminder.priority}
            status={reminder.status}
            onComplete={() => console.log('Reminder completed')}
            onEdit={() => console.log('Edit reminder')}
          />
        ))}
      </div>
    </div>
  )
}
