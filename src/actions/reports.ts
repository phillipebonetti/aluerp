'use server'

import { reportsService } from '@/src/services/reports.service'

// ==================== KPI ====================

export async function getKPIsAction(companyId: string, startDate: Date, endDate: Date) {
  try {
    const kpis = await reportsService.calculateKPIs(companyId, startDate, endDate)
    return { success: true, data: kpis }
  } catch (error) {
    console.error('[Reports] Erro ao calcular KPIs:', error)
    return { success: false, error: 'Falha ao calcular KPIs' }
  }
}

// ==================== CASH FLOW ====================

export async function getCashFlowAction(companyId: string, months?: number) {
  try {
    const cashFlow = await reportsService.getCashFlow(companyId, months)
    return { success: true, data: cashFlow }
  } catch (error) {
    console.error('[Reports] Erro ao obter fluxo de caixa:', error)
    return { success: false, error: 'Falha ao obter fluxo de caixa' }
  }
}

// ==================== COMMERCIAL ====================

export async function getCommercialMetricsAction(companyId: string, startDate: Date, endDate: Date) {
  try {
    const metrics = await reportsService.getCommercialMetrics(companyId, startDate, endDate)
    return { success: true, data: metrics }
  } catch (error) {
    console.error('[Reports] Erro ao obter métricas comerciais:', error)
    return { success: false, error: 'Falha ao obter métricas comerciais' }
  }
}

// ==================== TOP PERFORMERS ====================

export async function getTopSellersAction(companyId: string, limit?: number) {
  try {
    const sellers = await reportsService.getTopSellers(companyId, limit)
    return { success: true, data: sellers }
  } catch (error) {
    console.error('[Reports] Erro ao obter top sellers:', error)
    return { success: false, error: 'Falha ao obter top sellers' }
  }
}

// ==================== DASHBOARD ====================

export async function getDashboardLayoutAction(companyId: string, userId: string) {
  try {
    const layout = await reportsService.getDashboardLayout(companyId, userId)
    return { success: true, data: layout }
  } catch (error) {
    console.error('[Reports] Erro ao obter layout:', error)
    return { success: false, error: 'Falha ao obter layout' }
  }
}

export async function saveDashboardLayoutAction(companyId: string, userId: string, widgets: any) {
  try {
    const layout = await reportsService.saveDashboardLayout(companyId, userId, widgets)
    return { success: true, data: layout }
  } catch (error) {
    console.error('[Reports] Erro ao salvar layout:', error)
    return { success: false, error: 'Falha ao salvar layout' }
  }
}
