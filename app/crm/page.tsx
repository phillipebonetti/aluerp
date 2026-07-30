import { CRMDashboard } from '@/components/crm/crm-dashboard'
import { getOpportunities } from '@/src/modules/crm/actions/opportunities'
import { getLeads } from '@/src/modules/crm/actions/leads'
import { getCurrentUser } from '@/src/core/auth'
import { redirect } from 'next/navigation'

export default async function CRMPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  // TODO: Get user's company ID from session/database
  const companyId = 'comp-1'

  const [opportunities, leads] = await Promise.all([
    getOpportunities(companyId),
    getLeads(companyId)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu pipeline de vendas e leads</p>
      </div>

      <CRMDashboard opportunities={opportunities} leads={leads} />
    </div>
  )
}
