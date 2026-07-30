import { PipelineBoard } from '@/components/crm'
import { getOpportunities } from '@/src/modules/crm/actions/opportunities'
import { getCurrentUser } from '@/src/core/auth'
import { redirect } from 'next/navigation'

export default async function PipelinePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  // TODO: Get user's company ID from session/database
  const companyId = 'comp-1'

  const opportunities = await getOpportunities(companyId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
        <p className="text-muted-foreground mt-1">Visualize e gerencie todas as oportunidades</p>
      </div>

      <PipelineBoard
        opportunities={opportunities}
        onCardClick={(opp) => console.log('Oportunidade selecionada:', opp)}
      />
    </div>
  )
}
