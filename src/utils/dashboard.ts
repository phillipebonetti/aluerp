export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatPercentage = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export const calculateMonthlyTrend = (values: number[]) => {
  if (values.length < 2) return 0
  const current = values[values.length - 1]
  const previous = values[values.length - 2]
  return calculateTrend(current, previous)
}

export const getTrendColor = (trend: number): 'text-green-600' | 'text-red-600' | 'text-gray-500' => {
  if (trend > 0) return 'text-green-600'
  if (trend < 0) return 'text-red-600'
  return 'text-gray-500'
}

export const getTrendBgColor = (trend: number): string => {
  if (trend > 0) return 'bg-green-50'
  if (trend < 0) return 'bg-red-50'
  return 'bg-gray-50'
}

export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatMonthYear = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit'
  })
}

export const getDaysUntilDue = (dueDate: Date | string) => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const diff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export const getDueStatus = (daysUntilDue: number): 'overdue' | 'urgent' | 'warning' | 'ok' => {
  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue === 0) return 'urgent'
  if (daysUntilDue <= 7) return 'warning'
  return 'ok'
}

export const getStatusColor = (status: 'overdue' | 'urgent' | 'warning' | 'ok') => {
  const colors = {
    overdue: 'text-red-600 bg-red-50',
    urgent: 'text-orange-600 bg-orange-50',
    warning: 'text-yellow-600 bg-yellow-50',
    ok: 'text-green-600 bg-green-50'
  }
  return colors[status]
}

export const calculatePercentageProgress = (current: number, target: number) => {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

export const generateExcelData = (dashboard: any) => {
  // Estrutura base para gerar Excel
  return {
    'Dashboard': [{
      'Período': new Date().toLocaleDateString('pt-BR'),
      'Saldo em Caixa': dashboard.kpis?.netRevenue || 0,
      'Contas a Receber': dashboard.kpis?.receivables || 0,
      'Contas a Pagar': dashboard.kpis?.payables || 0,
      'Lucro': dashboard.kpis?.profit || 0,
      'Faturamento': dashboard.kpis?.totalRevenue || 0,
    }]
  }
}

export const generatePDFContent = (dashboard: any) => {
  return `
    DASHBOARD EXECUTIVO - ${new Date().toLocaleDateString('pt-BR')}
    
    INDICADORES PRINCIPAIS
    Saldo em Caixa: ${formatCurrency(dashboard.kpis?.netRevenue || 0)}
    Contas a Receber: ${formatCurrency(dashboard.kpis?.receivables || 0)}
    Contas a Pagar: ${formatCurrency(dashboard.kpis?.payables || 0)}
    Lucro: ${formatCurrency(dashboard.kpis?.profit || 0)}
    Faturamento: ${formatCurrency(dashboard.kpis?.totalRevenue || 0)}
  `
}

// Skeleton data for loading states
export const generateSkeletonData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `skeleton-${i}`,
    isLoading: true
  }))
}
