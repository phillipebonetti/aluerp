import { useState, useEffect, useCallback } from 'react'
import { 
  getKPIsAction, 
  getCashFlowAction, 
  getCommercialMetricsAction, 
  getTopSellersAction 
} from '@/src/actions/reports'

export interface DashboardFilters {
  period: '30' | '90' | '180' | '365'
  startDate?: Date
  endDate?: Date
  clientId?: string
  supplierId?: string
  status?: string
}

export function useDashboardData(companyId: string, filters: DashboardFilters) {
  const [kpis, setKpis] = useState<any>(null)
  const [cashFlow, setCashFlow] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateDateRange = useCallback(() => {
    const endDate = new Date()
    const startDate = new Date()
    
    const days = parseInt(filters.period)
    startDate.setDate(startDate.getDate() - days)
    
    return { startDate, endDate }
  }, [filters.period])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { startDate, endDate } = calculateDateRange()
      const months = parseInt(filters.period) > 90 ? 12 : 3

      const [kpisRes, cashFlowRes, metricsRes, sellersRes] = await Promise.all([
        getKPIsAction(companyId, startDate, endDate),
        getCashFlowAction(companyId, months),
        getCommercialMetricsAction(companyId, startDate, endDate),
        getTopSellersAction(companyId, 10)
      ])

      if (kpisRes.success) setKpis(kpisRes.data)
      if (cashFlowRes.success) setCashFlow(cashFlowRes.data)
      if (metricsRes.success) setMetrics(metricsRes.data)
      if (sellersRes.success) setSellers(sellersRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [companyId, calculateDateRange])

  useEffect(() => {
    loadData()
  }, [companyId, filters, loadData])

  return { kpis, cashFlow, metrics, sellers, loading, error, refetch: loadData }
}

export function useDashboardFilters() {
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardFilters')
      return saved ? JSON.parse(saved) : { period: '90' }
    }
    return { period: '90' }
  })

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      localStorage.setItem('dashboardFilters', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { filters, updateFilters }
}
