import { getPrisma } from '@/src/core/database'
import type { Lead, Opportunity, Activity, SalesGoal, CommercialMetrics } from '@prisma/client'

export class CRMService {
  private prisma = getPrisma()

  // ==================== LEADS ====================

  async getLeads(companyId: string, filter?: { status?: string; source?: string; responsible?: string }) {
    return this.prisma.lead.findMany({
      where: {
        companyId,
        ...(filter?.status && { status: filter.status as any }),
        ...(filter?.source && { source: filter.source as any }),
        ...(filter?.responsible && { responsibleId: filter.responsible }),
      },
      include: { responsible: true, opportunity: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getLeadById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { responsible: true, opportunity: true, activities: true, history: true },
    })
  }

  async createLead(data: {
    companyId: string
    name: string
    email?: string
    phone?: string
    whatsapp?: string
    cpf?: string
    cnpj?: string
    source: string
    city?: string
    address?: string
    estimatedValue?: number
    responsibleId?: string
    interests?: string
    notes?: string
  }) {
    return this.prisma.lead.create({ data })
  }

  async updateLead(id: string, data: any) {
    return this.prisma.lead.update({ where: { id }, data })
  }

  async leadToOpportunity(leadId: string, companyId: string, value: number, probability: number = 10) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new Error('Lead não encontrado')

    return this.prisma.opportunity.create({
      data: {
        companyId,
        leadId,
        value,
        probability,
        stage: 'NEW_LEAD' as any,
        responsibleId: lead.responsibleId,
      },
    })
  }

  // ==================== OPORTUNIDADES ====================

  async getOpportunities(companyId: string, filter?: { stage?: string; status?: string }) {
    return this.prisma.opportunity.findMany({
      where: {
        companyId,
        ...(filter?.stage && { stage: filter.stage as any }),
        ...(filter?.status && { status: filter.status as any }),
      },
      include: { lead: true, responsible: true, client: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async moveOpportunity(id: string, newStage: string) {
    return this.prisma.opportunity.update({
      where: { id },
      data: { stage: newStage as any },
    })
  }

  async updateOpportunityProbability(id: string, probability: number) {
    return this.prisma.opportunity.update({
      where: { id },
      data: { probability },
    })
  }

  async closeOpportunity(id: string, status: 'WON' | 'LOST', lossReasonId?: string) {
    return this.prisma.opportunity.update({
      where: { id },
      data: {
        status: status === 'WON' ? 'CLOSED_WON' : 'CLOSED_LOST',
        closedAt: new Date(),
        lossReasonId,
      },
    })
  }

  // ==================== ATIVIDADES ====================

  async getActivities(companyId: string, filter?: { leadId?: string; opportunityId?: string }) {
    return this.prisma.activity.findMany({
      where: {
        companyId,
        ...(filter?.leadId && { leadId: filter.leadId }),
        ...(filter?.opportunityId && { opportunityId: filter.opportunityId }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createActivity(data: {
    companyId: string
    type: string
    title: string
    description?: string
    leadId?: string
    opportunityId?: string
    result?: string
    nextAction?: string
    scheduledFor?: Date
    createdBy: string
  }) {
    return this.prisma.activity.create({ data })
  }

  // ==================== METAS ====================

  async getSalesGoals(companyId: string, month: number, year: number, employeeId?: string) {
    return this.prisma.salesGoal.findMany({
      where: {
        companyId,
        month,
        year,
        ...(employeeId && { employeeId }),
      },
      include: { employee: true },
    })
  }

  async createSalesGoal(data: {
    companyId: string
    employeeId?: string
    month: number
    year: number
    revenueTarget: number
    quantityTarget?: number
    conversionTarget?: number
  }) {
    return this.prisma.salesGoal.create({ data })
  }

  async updateGoalProgress(goalId: string, revenue: number, quantity?: number) {
    return this.prisma.salesGoal.update({
      where: { id: goalId },
      data: {
        achievedRevenue: revenue,
        ...(quantity && { achievedQuantity: quantity }),
      },
    })
  }

  // ==================== MÉTRICAS ====================

  async getMetrics(companyId: string, period: string) {
    return this.prisma.commercialMetrics.findUnique({
      where: { companyId_period: { companyId, period } },
    })
  }

  async calculateMetrics(companyId: string, period: string) {
    const [leads, opportunities, revenue, closingTimes] = await Promise.all([
      this.prisma.lead.count({ where: { companyId, createdAt: { gte: new Date(`${period}-01`) } } }),
      this.prisma.opportunity.count({ where: { companyId, status: 'CLOSED_WON' } }),
      this.prisma.opportunity.aggregate({
        where: { companyId, status: 'CLOSED_WON' },
        _sum: { value: true },
      }),
      this.getAverageClosingTime(companyId),
    ])

    const converted = opportunities
    const rate = leads > 0 ? (converted / leads) * 100 : 0
    const totalRevenue = revenue._sum.value || 0

    return this.prisma.commercialMetrics.upsert({
      where: { companyId_period: { companyId, period } },
      create: {
        companyId,
        period,
        leadsGenerated: leads,
        opportunitiesClosed: converted,
        conversionRate: rate,
        totalRevenue,
        averageClosingTime: closingTimes,
      },
      update: {
        leadsGenerated: leads,
        opportunitiesClosed: converted,
        conversionRate: rate,
        totalRevenue,
        averageClosingTime: closingTimes,
      },
    })
  }

  private async getAverageClosingTime(companyId: string): Promise<number> {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { companyId, closedAt: { not: null }, createdAt: { not: null } },
      select: { createdAt: true, closedAt: true },
    })

    if (opportunities.length === 0) return 0

    const times = opportunities.map((opp) => {
      const days = Math.floor(
        (new Date(opp.closedAt).getTime() - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return days
    })

    return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }

  // ==================== PÓS-VENDA ====================

  async getPostSaleByProject(projectId: string) {
    return this.prisma.postSale.findUnique({ where: { projectId } })
  }

  async createPostSale(data: {
    companyId: string
    projectId: string
    clientId: string
    warrantyMonths?: number
  }) {
    return this.prisma.postSale.create({ data })
  }

  async updatePostSaleStatus(postSaleId: string, status: string) {
    return this.prisma.postSale.update({
      where: { id: postSaleId },
      data: { status: status as any },
    })
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(companyId: string) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [leads, opportunities, quotes, goals, metrics] = await Promise.all([
      this.prisma.lead.count({
        where: { companyId, createdAt: { gte: today } },
      }),
      this.prisma.opportunity.count({
        where: { companyId, status: 'OPEN' },
      }),
      this.prisma.quote.count({
        where: { companyId, createdAt: { gte: today } },
      }),
      this.prisma.salesGoal.findMany({
        where: { companyId, month: now.getMonth() + 1, year: now.getFullYear() },
      }),
      this.getMetrics(companyId, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`),
    ])

    return {
      leadsToday: leads,
      openOpportunities: opportunities,
      quotesThisMonth: quotes,
      goals: goals.length > 0 ? goals[0] : null,
      metrics,
    }
  }
}

export const crmService = new CRMService()
