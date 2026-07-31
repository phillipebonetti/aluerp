'use server'

import { crmService } from '@/src/services/crm.service'
import { createNotificationAction } from './notifications'

// ==================== LEADS ====================

export async function getLeadsAction(companyId: string, filter?: any) {
  try {
    const leads = await crmService.getLeads(companyId, filter)
    return { success: true, data: leads }
  } catch (error) {
    console.error('[CRM] Erro ao obter leads:', error)
    return { success: false, error: 'Falha ao obter leads' }
  }
}

export async function getLeadByIdAction(id: string) {
  try {
    const lead = await crmService.getLeadById(id)
    return { success: true, data: lead }
  } catch (error) {
    console.error('[CRM] Erro ao obter lead:', error)
    return { success: false, error: 'Falha ao obter lead' }
  }
}

export async function createLeadAction(input: any) {
  try {
    const lead = await crmService.createLead(input)
    
    // Notificar responsável
    if (lead.responsibleId) {
      await createNotificationAction({
        userId: lead.responsibleId,
        companyId: input.companyId,
        title: 'Novo Lead',
        message: `Lead ${lead.name} foi criado`,
        type: 'INFO',
        category: 'CLIENTES',
        actionUrl: `/crm/leads/${lead.id}`,
      })
    }
    
    return { success: true, data: lead }
  } catch (error) {
    console.error('[CRM] Erro ao criar lead:', error)
    return { success: false, error: 'Falha ao criar lead' }
  }
}

export async function updateLeadAction(id: string, data: any) {
  try {
    const lead = await crmService.updateLead(id, data)
    return { success: true, data: lead }
  } catch (error) {
    console.error('[CRM] Erro ao atualizar lead:', error)
    return { success: false, error: 'Falha ao atualizar lead' }
  }
}

export async function convertLeadToOpportunityAction(leadId: string, companyId: string, value: number) {
  try {
    const opportunity = await crmService.leadToOpportunity(leadId, companyId, value)
    return { success: true, data: opportunity }
  } catch (error) {
    console.error('[CRM] Erro ao converter lead:', error)
    return { success: false, error: 'Falha ao converter lead' }
  }
}

// ==================== OPORTUNIDADES ====================

export async function getOpportunitiesAction(companyId: string, filter?: any) {
  try {
    const opportunities = await crmService.getOpportunities(companyId, filter)
    return { success: true, data: opportunities }
  } catch (error) {
    console.error('[CRM] Erro ao obter oportunidades:', error)
    return { success: false, error: 'Falha ao obter oportunidades' }
  }
}

export async function moveOpportunityAction(id: string, newStage: string) {
  try {
    const opportunity = await crmService.moveOpportunity(id, newStage)
    return { success: true, data: opportunity }
  } catch (error) {
    console.error('[CRM] Erro ao mover oportunidade:', error)
    return { success: false, error: 'Falha ao mover oportunidade' }
  }
}

export async function closeOpportunityAction(id: string, result: 'WON' | 'LOST', lossReasonId?: string) {
  try {
    const opportunity = await crmService.closeOpportunity(id, result, lossReasonId)
    return { success: true, data: opportunity }
  } catch (error) {
    console.error('[CRM] Erro ao fechar oportunidade:', error)
    return { success: false, error: 'Falha ao fechar oportunidade' }
  }
}

// ==================== ATIVIDADES ====================

export async function getActivitiesAction(companyId: string, filter?: any) {
  try {
    const activities = await crmService.getActivities(companyId, filter)
    return { success: true, data: activities }
  } catch (error) {
    console.error('[CRM] Erro ao obter atividades:', error)
    return { success: false, error: 'Falha ao obter atividades' }
  }
}

export async function createActivityAction(input: any) {
  try {
    const activity = await crmService.createActivity(input)
    return { success: true, data: activity }
  } catch (error) {
    console.error('[CRM] Erro ao criar atividade:', error)
    return { success: false, error: 'Falha ao criar atividade' }
  }
}

// ==================== METAS ====================

export async function getSalesGoalsAction(companyId: string, month: number, year: number, employeeId?: string) {
  try {
    const goals = await crmService.getSalesGoals(companyId, month, year, employeeId)
    return { success: true, data: goals }
  } catch (error) {
    console.error('[CRM] Erro ao obter metas:', error)
    return { success: false, error: 'Falha ao obter metas' }
  }
}

export async function createSalesGoalAction(input: any) {
  try {
    const goal = await crmService.createSalesGoal(input)
    return { success: true, data: goal }
  } catch (error) {
    console.error('[CRM] Erro ao criar meta:', error)
    return { success: false, error: 'Falha ao criar meta' }
  }
}

// ==================== MÉTRICAS ====================

export async function getMetricsAction(companyId: string, period: string) {
  try {
    const metrics = await crmService.getMetrics(companyId, period)
    return { success: true, data: metrics }
  } catch (error) {
    console.error('[CRM] Erro ao obter métricas:', error)
    return { success: false, error: 'Falha ao obter métricas' }
  }
}

export async function calculateMetricsAction(companyId: string, period: string) {
  try {
    const metrics = await crmService.calculateMetrics(companyId, period)
    return { success: true, data: metrics }
  } catch (error) {
    console.error('[CRM] Erro ao calcular métricas:', error)
    return { success: false, error: 'Falha ao calcular métricas' }
  }
}

// ==================== DASHBOARD ====================

export async function getCRMDashboardStatsAction(companyId: string) {
  try {
    const stats = await crmService.getDashboardStats(companyId)
    return { success: true, data: stats }
  } catch (error) {
    console.error('[CRM] Erro ao obter dashboard:', error)
    return { success: false, error: 'Falha ao obter dashboard' }
  }
}
