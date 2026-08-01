import { AIContextData, ERPContextQuery, ERPContextResult } from './types'

/**
 * ERPContextProvider - Acessa dados do ERP com respeito a permissões
 * Fornece contexto estruturado para o assistente IA
 */
export class ERPContextProvider {
  private companyId: string
  private userId: string

  constructor(companyId: string, userId: string) {
    this.companyId = companyId
    this.userId = userId
  }

  /**
   * Obtém contexto completo do ERP para o assistente
   */
  async getFullContext(): Promise<AIContextData> {
    return {
      works: await this.getWorksContext(),
      financial: await this.getFinancialContext(),
      clients: await this.getClientsContext(),
      suppliers: await this.getSuppliersContext(),
      sales: await this.getSalesContext(),
      receivables: await this.getReceivablesContext(),
      payables: await this.getPayablesContext()
    }
  }

  /**
   * Executa uma query de contexto
   */
  async executeContextQuery(query: ERPContextQuery): Promise<ERPContextResult> {
    switch (query.type) {
      case 'stats':
        return this.handleStatsQuery(query)
      case 'search':
        return this.handleSearchQuery(query)
      case 'analytics':
        return this.handleAnalyticsQuery(query)
      case 'recommendations':
        return this.handleRecommendationsQuery(query)
      default:
        throw new Error(`Tipo de query não suportado: ${query.type}`)
    }
  }

  // ==================== CONTEXTO OBRAS ====================

  private async getWorksContext() {
    // Em produção, consultaria o banco de dados
    // Por enquanto, retorna dados de exemplo
    return {
      total: 24,
      inProgress: 8,
      completed: 15,
      delayed: 1
    }
  }

  // ==================== CONTEXTO FINANCEIRO ====================

  private async getFinancialContext() {
    return {
      revenue: 245000,
      expenses: 180000,
      profit: 65000,
      cashFlow: 42000
    }
  }

  // ==================== CONTEXTO CLIENTES ====================

  private async getClientsContext() {
    return {
      total: 42,
      active: 38,
      inactive: 4,
      overdue: 3
    }
  }

  // ==================== CONTEXTO FORNECEDORES ====================

  private async getSuppliersContext() {
    return {
      total: 15,
      topSpend: [
        'Vidraçaria Premium',
        'Distribuidora ABC',
        'Materiais de Construção XYZ'
      ]
    }
  }

  // ==================== CONTEXTO VENDAS ====================

  private async getSalesContext() {
    return {
      total: 18,
      topSeller: 'João Silva',
      conversionRate: 0.42
    }
  }

  // ==================== CONTEXTO CONTAS A RECEBER ====================

  private async getReceivablesContext() {
    return {
      total: 125000,
      overdue: 35000,
      dueToday: 8500,
      upcomingDays7: 22000
    }
  }

  // ==================== CONTEXTO CONTAS A PAGAR ====================

  private async getPayablesContext() {
    return {
      total: 95000,
      overdue: 12000,
      dueToday: 5500,
      upcomingDays7: 18000
    }
  }

  // ==================== HANDLERS DE QUERY ====================

  private async handleStatsQuery(query: ERPContextQuery): Promise<ERPContextResult> {
    const context = await this.getFullContext()

    // Exemplo: "Quantas obras estão em andamento?"
    if (query.query.toLowerCase().includes('obras') && query.query.toLowerCase().includes('andamento')) {
      return {
        data: { count: context.works.inProgress, works: [] },
        summary: `Existem ${context.works.inProgress} obras em andamento no momento.`,
        confidence: 0.95
      }
    }

    // Exemplo: "Quanto faturamos este mês?"
    if (query.query.toLowerCase().includes('faturamento')) {
      return {
        data: { revenue: context.financial.revenue },
        summary: `Faturamento deste mês: R$ ${context.financial.revenue.toLocaleString('pt-BR')}`,
        confidence: 0.95
      }
    }

    return {
      data: {},
      summary: 'Query não pôde ser processada',
      confidence: 0
    }
  }

  private async handleSearchQuery(query: ERPContextQuery): Promise<ERPContextResult> {
    // Busca inteligente em linguagem natural
    // Exemplo: "Obras do cliente João em Criciúma"

    return {
      data: [],
      summary: 'Nenhum resultado encontrado',
      confidence: 0.7
    }
  }

  private async handleAnalyticsQuery(query: ERPContextQuery): Promise<ERPContextResult> {
    // Análises específicas
    // Exemplo: "Como está a margem de lucro?"

    const context = await this.getFullContext()
    const marginPercent = (context.financial.profit / context.financial.revenue) * 100

    return {
      data: {
        margin: marginPercent,
        revenue: context.financial.revenue,
        profit: context.financial.profit
      },
      summary: `Margem de lucro atual: ${marginPercent.toFixed(1)}% (R$ ${context.financial.profit.toLocaleString('pt-BR')} de lucro)`,
      confidence: 0.9
    }
  }

  private async handleRecommendationsQuery(query: ERPContextQuery): Promise<ERPContextResult> {
    // Recomendações baseadas em dados
    // Exemplo: "Quais são as oportunidades?"

    const context = await this.getFullContext()
    const recommendations = []

    // Recomendação 1: Clientes inativos
    if (context.clients.inactive > 0) {
      recommendations.push(`${context.clients.inactive} cliente(s) inativo(s) para reativação`)
    }

    // Recomendação 2: Contas vencidas
    if (context.receivables.overdue > 0) {
      recommendations.push(`R$ ${context.receivables.overdue.toLocaleString('pt-BR')} em contas a receber vencidas`)
    }

    // Recomendação 3: Obras atrasadas
    if (context.works.delayed > 0) {
      recommendations.push(`${context.works.delayed} obra(s) atrasada(s) requer(em) ação`)
    }

    return {
      data: { recommendations },
      summary: recommendations.join('\n'),
      confidence: 0.85
    }
  }

  // ==================== QUERIES ESPECÍFICAS ====================

  async queryTopClients(limit: number = 5): Promise<any[]> {
    // Retorna top N clientes por volume de vendas
    return [
      { name: 'Cliente A', totalSpend: 50000, orders: 5 },
      { name: 'Cliente B', totalSpend: 35000, orders: 3 },
      { name: 'Cliente C', totalSpend: 25000, orders: 2 }
    ].slice(0, limit)
  }

  async queryOverduePayments(): Promise<any[]> {
    // Retorna pagamentos vencidos
    return [
      { client: 'Cliente X', amount: 12000, daysOverdue: 15 },
      { client: 'Cliente Y', amount: 8000, daysOverdue: 8 }
    ]
  }

  async queryTopSellers(limit: number = 5): Promise<any[]> {
    // Retorna top N vendedores por volume
    return [
      { name: 'João Silva', totalSales: 125000, orders: 18 },
      { name: 'Maria Santos', totalSales: 95000, orders: 12 },
      { name: 'Pedro Costa', totalSales: 75000, orders: 10 }
    ].slice(0, limit)
  }

  async queryDelayedWorks(): Promise<any[]> {
    // Retorna obras atrasadas
    return [
      { name: 'Obra Reforma Apto', client: 'João Silva', daysLate: 5 },
      { name: 'Obra Construção Casa', client: 'Maria Santos', daysLate: 3 }
    ]
  }

  async queryHighestMarginWorks(limit: number = 5): Promise<any[]> {
    // Retorna obras com maior margem de lucro
    return [
      { name: 'Obra Premium', margin: 45, value: 50000 },
      { name: 'Obra Especial', margin: 38, value: 35000 }
    ].slice(0, limit)
  }

  // ==================== VALIDAÇÕES DE PERMISSÃO ====================

  private async validateUserAccess(resource: string): Promise<boolean> {
    // Em produção, verificaria RBAC do usuário
    // Por enquanto, retorna true
    return true
  }

  private async maskSensitiveData(data: any): Promise<any> {
    // Máscara dados sensíveis conforme permissões
    // Por exemplo: ocultar valores exatos se usuário não tiver acesso
    return data
  }
}

/**
 * Singleton para gerenciar instância de ERPContextProvider
 */
let contextProviderInstance: ERPContextProvider | null = null

export function initializeERPContext(companyId: string, userId: string): void {
  contextProviderInstance = new ERPContextProvider(companyId, userId)
}

export function getERPContext(): ERPContextProvider {
  if (!contextProviderInstance) {
    throw new Error('ERP Context não foi inicializado. Chame initializeERPContext primeiro.')
  }
  return contextProviderInstance
}
