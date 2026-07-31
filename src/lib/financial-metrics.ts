/**
 * Utilitários para cálculo de métricas financeiras
 */

export interface FinancialMetrics {
  revenue: number
  expense: number
  profit: number
  marginPercentage: number
  roi: number
}

export interface KPIMetrics {
  currentBalance: number
  monthlyRevenue: number
  annualRevenue: number
  monthlyExpense: number
  annualExpense: number
  monthlyProfit: number
  annualProfit: number
  cashFlow: number
  accountsReceivable: number
  accountsPayable: number
  newClients: number
  totalClients: number
  suppliers: number
  quotesCreated: number
  quotesApproved: number
  conversionRate: number
  activeProjects: number
  completedProjects: number
  averageTicket: number
  profitMargin: number
  totalCommission: number
  paidCommission: number
  pendingCommission: number
}

/**
 * Calcula lucro em relação à receita e despesa
 */
export function calculateProfit(revenue: number, expense: number): number {
  return Math.max(0, revenue - expense)
}

/**
 * Calcula margem de lucro como percentual
 */
export function calculateProfitMargin(profit: number, revenue: number): number {
  if (revenue === 0) return 0
  return (profit / revenue) * 100
}

/**
 * Calcula ROI (Return on Investment)
 */
export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0
  return (profit / investment) * 100
}

/**
 * Calcula taxa de conversão
 */
export function calculateConversionRate(approved: number, total: number): number {
  if (total === 0) return 0
  return (approved / total) * 100
}

/**
 * Calcula ticket médio
 */
export function calculateAverageTicket(totalRevenue: number, numberOfTransactions: number): number {
  if (numberOfTransactions === 0) return 0
  return totalRevenue / numberOfTransactions
}

/**
 * Compara dois valores e retorna a diferença percentual
 */
export function calculatePercentageDifference(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formata número com separadores
 */
export function formatNumber(value: number, locale = 'pt-BR'): string {
  return value.toLocaleString(locale)
}

/**
 * Calcula crescimento entre dois períodos
 */
export function calculateGrowth(current: number, previous: number): { value: number; direction: 'UP' | 'DOWN' | 'NEUTRAL' } {
  const diff = current - previous

  if (diff === 0) {
    return { value: 0, direction: 'NEUTRAL' }
  }

  return {
    value: Math.abs(((diff / (previous || 1)) * 100)),
    direction: diff > 0 ? 'UP' : 'DOWN',
  }
}

/**
 * Calcula projeção baseada em média móvel
 */
export function projectForecast(values: number[], periods = 30): number[] {
  if (values.length === 0) return []

  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const forecast: number[] = []

  for (let i = 0; i < periods; i++) {
    // Adiciona variação aleatória de ±10% da média
    const variation = (Math.random() - 0.5) * 0.2
    forecast.push(Math.max(0, avg * (1 + variation)))
  }

  return forecast
}

/**
 * Identifica alertas baseado em métricas
 */
export interface Alert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  action?: {
    label: string
    href: string
  }
}

export function generateAlerts(metrics: Partial<KPIMetrics>): Alert[] {
  const alerts: Alert[] = []

  // Alerta: Receita caindo
  if (
    metrics.monthlyRevenue &&
    metrics.annualRevenue &&
    metrics.monthlyRevenue < metrics.annualRevenue / 12 * 0.8
  ) {
    alerts.push({
      id: 'revenue-down',
      title: 'Receita abaixo do esperado',
      message: 'Sua receita este mês está 20% abaixo da média mensal anual.',
      severity: 'warning',
      action: { label: 'Ver relatório', href: '/reports' },
    })
  }

  // Alerta: Lucro abaixo da meta
  if (metrics.monthlyProfit && metrics.monthlyProfit < 0) {
    alerts.push({
      id: 'negative-profit',
      title: 'Lucro negativo',
      message: 'Você está operando no prejuízo este mês.',
      severity: 'error',
      action: { label: 'Analisar despesas', href: '/expenses' },
    })
  }

  // Alerta: Contas vencidas
  if (metrics.accountsPayable && metrics.accountsPayable > 0) {
    alerts.push({
      id: 'overdue-accounts',
      title: 'Contas a pagar vencidas',
      message: 'Você tem R$ ' + metrics.accountsPayable.toLocaleString('pt-BR') + ' em contas vencidas.',
      severity: 'warning',
      action: { label: 'Pagar agora', href: '/payments' },
    })
  }

  // Alerta: Baixa conversão
  if (metrics.conversionRate && metrics.conversionRate < 5) {
    alerts.push({
      id: 'low-conversion',
      title: 'Taxa de conversão baixa',
      message: `Sua taxa de conversão é de apenas ${metrics.conversionRate.toFixed(1)}%.`,
      severity: 'warning',
      action: { label: 'Analisar orçamentos', href: '/quotes' },
    })
  }

  // Alerta: Fluxo de caixa negativo
  if (metrics.cashFlow && metrics.cashFlow < 0) {
    alerts.push({
      id: 'negative-cashflow',
      title: 'Fluxo de caixa negativo',
      message: 'Suas saídas estão superando suas entradas.',
      severity: 'error',
      action: { label: 'Ver fluxo de caixa', href: '/cash-flow' },
    })
  }

  return alerts
}

/**
 * Calcula distribuição por categoria
 */
export function calculateCategoryDistribution(
  items: Array<{ category: string; value: number }>
): Array<{ name: string; value: number; percentage: number }> {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return items
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      name: item.category,
      value: item.value,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }))
}

/**
 * Agrupa dados por período
 */
export function groupByPeriod(
  data: Array<{ date: Date; value: number }>,
  period: 'day' | 'week' | 'month' | 'year'
): Array<{ label: string; value: number; date: Date }> {
  const grouped: Record<string, number> = {}
  const dateMap: Record<string, Date> = {}

  data.forEach(({ date, value }) => {
    let key = ''
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        dateMap[key] = weekStart
        break
      case 'month':
        key = date.toISOString().slice(0, 7)
        break
      case 'year':
        key = date.getFullYear().toString()
        break
    }
    grouped[key] = (grouped[key] || 0) + value
    if (!dateMap[key]) dateMap[key] = date
  })

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({
      label,
      value,
      date: dateMap[label],
    }))
}
