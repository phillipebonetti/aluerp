import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOpportunities } from '@/src/modules/crm/actions/opportunities'
import { getCurrentUser } from '@/src/core/auth'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'

export default async function OpportunitiesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  // TODO: Get user's company ID from session/database
  const companyId = 'comp-1'

  const opportunities = await getOpportunities(companyId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie todas as oportunidades</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opportunities.map(opp => (
          <Card key={opp.id} className="p-4">
            <h3 className="font-semibold mb-2">{opp.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Etapa:</span>
                <span className="font-medium">{opp.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">R$ {opp.value.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Probabilidade:</span>
                <span className="font-medium">{opp.probability}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
