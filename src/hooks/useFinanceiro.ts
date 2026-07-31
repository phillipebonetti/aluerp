'use client'

import { useCallback, useState } from 'react'
import { useCache } from './useCache'
import type { Transaction, Account } from '@prisma/client'

interface FinancialFilters {
  startDate?: Date
  endDate?: Date
  type?: 'INCOME' | 'EXPENSE'
  status?: 'PENDING' | 'CONFIRMED' | 'PAID'
  category?: string
  accountId?: string
}

interface FinancialMetrics {
  totalIncome: number
  totalExpense: number
  balance: number
  accountsValue: number
  upcomingPayments: number
}

interface UseFinanceiroReturn {
  // Data
  transactions: Transaction[]
  accounts: Account[]
  metrics: FinancialMetrics | null
  isLoading: boolean
  error: Error | null

  // Actions
  listarTransacoes: (filters?: FinancialFilters) => Promise<void>
  listarContas: () => Promise<void>
  obterMetricas: () => Promise<void>
  criarTransacao: (data: Partial<Transaction>) => Promise<Transaction | null>
  atualizarTransacao: (id: string, data: Partial<Transaction>) => Promise<Transaction | null>
  deletarTransacao: (id: string) => Promise<boolean>
  revalidar: () => Promise<void>
}

/**
 * Hook para gerenciar dados financeiros
 * Integra com FinancialService via Server Actions
 * Fornece métricas, transações e contas com cache separado
 */
export function useFinanceiro(): UseFinanceiroReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<FinancialFilters>()

  // Cache de transações
  const { data: cachedTransactions, isLoading: loadingTransactions, revalidate: revalidateTransactions } = useCache(
    `transactions:${JSON.stringify(filters || {})}`,
    async () => {
      try {
        const response = await fetch('/api/financeiro/transacoes', {
          method: 'POST',
          body: JSON.stringify({ action: 'list', filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar transações')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 2 * 60 * 1000 } // 2 minutos - financeiro deve atualizar mais frequente
  )

  // Cache de contas
  const { data: cachedAccounts, isLoading: loadingAccounts, revalidate: revalidateAccounts } = useCache(
    'accounts',
    async () => {
      try {
        const response = await fetch('/api/financeiro/contas')
        if (!response.ok) throw new Error('Erro ao buscar contas')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return []
      }
    },
    { ttl: 10 * 60 * 1000 } // 10 minutos
  )

  // Cache de métricas
  const { data: cachedMetrics, isLoading: loadingMetrics, revalidate: revalidateMetrics } = useCache(
    `metrics:${filters?.startDate}:${filters?.endDate}`,
    async () => {
      try {
        const response = await fetch('/api/financeiro/metricas', {
          method: 'POST',
          body: JSON.stringify({ filters }),
        })
        if (!response.ok) throw new Error('Erro ao buscar métricas')
        return response.json()
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        return null
      }
    },
    { ttl: 1 * 60 * 1000 } // 1 minuto - métricas são críticas
  )

  const listarTransacoes = useCallback(async (newFilters?: FinancialFilters) => {
    setFilters(newFilters)
    setTransactions(cachedTransactions || [])
  }, [cachedTransactions])

  const listarContas = useCallback(async () => {
    setAccounts(cachedAccounts || [])
  }, [cachedAccounts])

  const obterMetricas = useCallback(async () => {
    setMetrics(cachedMetrics || null)
  }, [cachedMetrics])

  const criarTransacao = useCallback(async (data: Partial<Transaction>) => {
    try {
      setError(null)
      const response = await fetch('/api/financeiro/transacoes', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data }),
      })
      if (!response.ok) throw new Error('Erro ao criar transação')
      const newTransaction = await response.json()
      setTransactions((prev) => [newTransaction, ...prev])
      // Revalidar métricas após nova transação
      await revalidateMetrics()
      return newTransaction
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar transação')
      setError(error)
      return null
    }
  }, [revalidateMetrics])

  const atualizarTransacao = useCallback(async (id: string, data: Partial<Transaction>) => {
    try {
      setError(null)
      const response = await fetch(`/api/financeiro/transacoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar transação')
      const updated = await response.json()
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      )
      // Revalidar métricas após atualização
      await revalidateMetrics()
      return updated
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar transação')
      setError(error)
      return null
    }
  }, [revalidateMetrics])

  const deletarTransacao = useCallback(async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/financeiro/transacoes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao deletar transação')
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      // Revalidar métricas após deleção
      await revalidateMetrics()
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar transação')
      setError(error)
      return false
    }
  }, [revalidateMetrics])

  const revalidar = useCallback(async () => {
    await Promise.all([
      revalidateTransactions(),
      revalidateAccounts(),
      revalidateMetrics(),
    ])
  }, [revalidateTransactions, revalidateAccounts, revalidateMetrics])

  return {
    transactions: cachedTransactions || transactions,
    accounts: cachedAccounts || accounts,
    metrics: cachedMetrics || metrics,
    isLoading: loadingTransactions || loadingAccounts || loadingMetrics,
    error,
    listarTransacoes,
    listarContas,
    obterMetricas,
    criarTransacao,
    atualizarTransacao,
    deletarTransacao,
    revalidar,
  }
}
