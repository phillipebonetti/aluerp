'use client'

import { useState, useCallback, useEffect } from 'react'
import { useCache } from './useCache'

export interface CompanySettings {
  logo?: string
  razaoSocial?: string
  cnpj?: string
  email?: string
  whatsapp?: string
  comissaoPercentual?: number
  impostoPercentual?: number
  horarioAbertura?: string
  horarioFechamento?: string
  metaVendas?: number
  metaClientes?: number
  proximoNumeroOS?: number
  proximoNumeroOrcamento?: number
  proximoNumeroNota?: number
  assinaturaPadrao?: string
  carimboNota?: string
  rodapePadrao?: string
}

export function useCompanySettings() {
  const { get, set, clear } = useCache('company-settings')
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega as configurações do cache ou do servidor
  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Tenta buscar do cache
      const cached = get()
      if (cached) {
        setSettings(cached as CompanySettings)
        setLoading(false)
        return
      }

      // Se não está em cache, busca do servidor
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Erro ao buscar configurações')

      const data = await response.json()
      set(data, 60 * 60 * 1000) // Cache por 1 hora
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [get, set])

  // Atualiza as configurações
  const updateSettings = useCallback(
    async (updates: Partial<CompanySettings>) => {
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!response.ok) throw new Error('Erro ao atualizar configurações')

        const updated = await response.json()
        clear() // Limpa cache
        setSettings(updated)
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        throw err
      }
    },
    [clear]
  )

  // Carrega settings na montagem
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
  }
}

// Hook para valores individuais
export function useSettingValue<K extends keyof CompanySettings>(key: K) {
  const { settings, updateSettings } = useCompanySettings()

  return {
    value: settings?.[key],
    update: (value: CompanySettings[K]) =>
      updateSettings({ [key]: value } as Partial<CompanySettings>),
  }
}
