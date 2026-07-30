import { Card } from '@/components/ui/card'
import { ActivityTimeline } from '@/components/crm'
import { getCurrentUser } from '@/src/core/auth'
import { redirect } from 'next/navigation'
import type { CRMInteraction } from '@/src/modules/crm/types'

// Mock interactions data
const mockInteractions: CRMInteraction[] = [
  {
    id: '1',
    companyId: 'comp-1',
    leadId: '1',
    type: 'email',
    subject: 'Proposta enviada para João Silva',
    notes: 'Enviado PDF com detalhes da solução',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    companyId: 'comp-1',
    leadId: '2',
    type: 'call',
    subject: 'Ligação com Maria Santos',
    notes: 'Interessada em conhecer demo da plataforma',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    companyId: 'comp-1',
    opportunityId: '1',
    type: 'meeting',
    subject: 'Reunião com stakeholders da Tech Corp',
    notes: 'Discutidos requisitos e timeline do projeto',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
]

export default async function HistoryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
        <p className="text-muted-foreground mt-1">Acompanhe todas as atividades e interações</p>
      </div>

      <Card className="p-6">
        <ActivityTimeline activities={mockInteractions} />
      </Card>
    </div>
  )
}
