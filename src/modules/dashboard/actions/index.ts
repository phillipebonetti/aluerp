'use server'

import { getSession } from '@/src/core/auth'
import { DashboardService } from '@/src/services/dashboard.service'

export async function getDashboardData() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const dashboardService = new DashboardService()
    const data = await dashboardService.getDashboardData({
      companyId: session.company.id,
    })

    return { data }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function getDashboardKPIs() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const dashboardService = new DashboardService()
    const financialService = dashboardService['financialService']
    const kpis = await financialService.getDashboardKPIs({
      companyId: session.company.id,
    })

    return { data: kpis }
  } catch (error: unknown) {
    return { error: error.message }
  }
}
