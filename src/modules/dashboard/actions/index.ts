'use server'

import { getCurrentUser } from '@/src/core/auth'
import { DashboardService } from '@/src/services/dashboard.service'

export async function getDashboardData() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const dashboardService = new DashboardService()
    const data = await dashboardService.getDashboardData({
      companyId: user.companyId,
    })

    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getDashboardKPIs() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const dashboardService = new DashboardService()
    const financialService = dashboardService['financialService']
    const kpis = await financialService.getDashboardKPIs({
      companyId: user.companyId,
    })

    return { data: kpis }
  } catch (error: any) {
    return { error: error.message }
  }
}
