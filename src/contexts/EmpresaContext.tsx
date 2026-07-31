'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'

export interface CompanyData {
  id: string
  name: string
  cnpj?: string
  phone?: string
  email?: string
  logo?: string
  website?: string
  timezone: string
  plan: string
  status: string
}

export interface GlobalFilters {
  status?: string
  category?: string
  startDate?: string
  endDate?: string
  searchTerm?: string
  sortBy?: string
  page?: number
  limit?: number
}

export interface CompanyPermission {
  code: string
  name: string
  description?: string
}

export interface EmpresaContextType {
  // Dados
  company: CompanyData | null
  filters: GlobalFilters
  permissions: CompanyPermission[]
  isLoading: boolean
  error: string | null

  // Operações
  setActiveCompany: (companyId: string) => Promise<void>
  updateFilters: (filters: Partial<GlobalFilters>) => void
  resetFilters: () => void
  loadCompanyData: () => Promise<void>
  loadPermissions: () => Promise<void>
  refreshCompanyData: () => Promise<void>
  hasPermission: (permissionCode: string) => boolean
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined)

interface EmpresaProviderProps {
  children: React.ReactNode
  companyId?: string
}

const DEFAULT_FILTERS: GlobalFilters = {
  status: 'ACTIVE',
  page: 1,
  limit: 20,
}

export function EmpresaProvider({ children, companyId }: EmpresaProviderProps) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS)
  const [permissions, setPermissions] = useState<CompanyPermission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados da empresa ao montar
  useEffect(() => {
    if (companyId) {
      const initializeCompany = async () => {
        try {
          setIsLoading(true)
          setError(null)
          await Promise.all([loadCompanyData(), loadPermissions()])
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao inicializar empresa'
          setError(message)
        } finally {
          setIsLoading(false)
        }
      }

      initializeCompany()
    }
  }, [companyId])

  const setActiveCompany = useCallback(async (newCompanyId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${newCompanyId}`)
      if (!response.ok) {
        throw new Error('Falha ao carregar empresa')
      }

      const data = await response.json()
      setCompany(data)
      
      // Limpar permissões e filtros ao trocar empresa
      setPermissions([])
      setFilters(DEFAULT_FILTERS)
      
      // Carregar novas permissões
      await loadPermissions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao trocar empresa'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadCompanyData = useCallback(async () => {
    if (!companyId) return

    try {
      const response = await fetch(`/api/companies/${companyId}`)
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da empresa')
      }

      const data = await response.json()
      setCompany(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar empresa'
      setError(message)
      throw err
    }
  }, [companyId])

  const loadPermissions = useCallback(async () => {
    if (!companyId) return

    try {
      const response = await fetch(`/api/companies/${companyId}/permissions`)
      if (!response.ok) {
        throw new Error('Falha ao carregar permissões')
      }

      const data = await response.json()
      setPermissions(data.permissions || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar permissões'
      setError(message)
      throw err
    }
  }, [companyId])

  const refreshCompanyData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await Promise.all([loadCompanyData(), loadPermissions()])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar dados'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadCompanyData, loadPermissions])

  const updateFilters = useCallback((newFilters: Partial<GlobalFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset página ao mudar filtros
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasPermission = useCallback((permissionCode: string): boolean => {
    return permissions.some(p => p.code === permissionCode)
  }, [permissions])

  const value: EmpresaContextType = {
    company,
    filters,
    permissions,
    isLoading,
    error,
    setActiveCompany,
    updateFilters,
    resetFilters,
    loadCompanyData,
    loadPermissions,
    refreshCompanyData,
    hasPermission,
  }

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
}

/**
 * Hook para usar o EmpresaContext
 * @throws {Error} Se usado fora do EmpresaProvider
 */
export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (context === undefined) {
    throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider')
  }
  return context
}

/**
 * Hook para acessar apenas os filtros globais
 */
export function useGlobalFilters() {
  const { filters, updateFilters, resetFilters } = useEmpresa()
  return { filters, updateFilters, resetFilters }
}

/**
 * Hook para acessar apenas os dados da empresa
 */
export function useCompanyData() {
  const { company, isLoading, error, refreshCompanyData } = useEmpresa()
  return { company, isLoading, error, refresh: refreshCompanyData }
}

/**
 * Hook para verificar permissões da empresa
 */
export function useCompanyPermissions() {
  const { permissions, hasPermission } = useEmpresa()
  return { permissions, hasPermission }
}
