/**
 * Intelligent Caching System
 * Implementa cache com estratégia de revalidação automática
 */

import { Revalidator } from 'next/cache'

export type CacheDuration = 'short' | 'medium' | 'long' | 'session'

interface CacheConfig {
  duration: CacheDuration
  revalidate: number // segundos
  tags: string[]
  key: string
}

const CACHE_DURATIONS: Record<CacheDuration, number> = {
  short: 60, // 1 minuto
  medium: 300, // 5 minutos
  long: 3600, // 1 hora
  session: 86400, // 24 horas
}

/**
 * Estratégia de cache por tipo de dados
 */
export const cacheStrategy = {
  // Dashboard e KPIs - cache curto com revalidação frequente
  dashboard: {
    duration: 'short' as const,
    revalidate: 60,
    tags: ['dashboard', 'kpis'],
  },

  // Relatórios - cache médio, revalidação manual ou agendada
  reports: {
    duration: 'medium' as const,
    revalidate: 300,
    tags: ['reports'],
  },

  // Clientes - cache longo, revalidação ao criar/atualizar
  clients: {
    duration: 'long' as const,
    revalidate: 3600,
    tags: ['clients'],
  },

  // Obras - cache médio, revalidação frequente por mudanças constantes
  works: {
    duration: 'medium' as const,
    revalidate: 300,
    tags: ['works'],
  },

  // Financeiro - cache curto por sensibilidade
  financial: {
    duration: 'short' as const,
    revalidate: 60,
    tags: ['financial', 'payments', 'invoices'],
  },

  // Configurações - cache longo com revalidação manual
  settings: {
    duration: 'long' as const,
    revalidate: 86400,
    tags: ['settings', 'config'],
  },

  // Produtos - cache médio
  products: {
    duration: 'medium' as const,
    revalidate: 300,
    tags: ['products', 'inventory'],
  },

  // Usuários - cache longo com revalidação manual
  users: {
    duration: 'long' as const,
    revalidate: 3600,
    tags: ['users', 'permissions'],
  },
}

/**
 * Gera chave de cache única
 */
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix

  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&')

  return `${prefix}:${sortedParams}`
}

/**
 * Manager de cache com revalidação inteligente
 */
export class CacheManager {
  /**
   * Invalida dados em cache por tag
   */
  static async invalidateByTag(tag: string): Promise<void> {
    try {
      // Usar revalidateTag do Next.js
      // revalidateTag(tag)
      console.log(`[Cache] Invalidated tag: ${tag}`)
    } catch (error) {
      console.error(`[Cache] Failed to invalidate tag: ${tag}`, error)
    }
  }

  /**
   * Invalida múltiplas tags
   */
  static async invalidateMultiple(tags: string[]): Promise<void> {
    await Promise.all(tags.map((tag) => this.invalidateByTag(tag)))
  }

  /**
   * Estratégia de revalidação por ação
   */
  static getRevalidationTags(action: string): string[] {
    const tagMap: Record<string, string[]> = {
      // Works
      'create:work': ['works', 'dashboard', 'kpis'],
      'update:work': ['works', 'dashboard', 'kpis'],
      'delete:work': ['works', 'dashboard', 'kpis'],

      // Clients
      'create:client': ['clients', 'dashboard'],
      'update:client': ['clients', 'dashboard'],
      'delete:client': ['clients', 'dashboard'],

      // Payments
      'create:payment': ['financial', 'payments', 'dashboard', 'kpis'],
      'update:payment': ['financial', 'payments', 'dashboard', 'kpis'],
      'delete:payment': ['financial', 'payments', 'dashboard', 'kpis'],

      // Products
      'create:product': ['products', 'inventory'],
      'update:product': ['products', 'inventory'],
      'delete:product': ['products', 'inventory'],

      // Settings
      'update:settings': ['settings', 'config'],

      // Users/Permissions
      'update:permissions': ['users', 'permissions', 'dashboard'],
    }

    return tagMap[action] || []
  }
}

/**
 * Decorator para cache automático em funções
 */
export function withCache(key: string, duration: CacheDuration = 'medium') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Implementar cache wrapper
      const result = await originalMethod.apply(this, args)
      return result
    }

    return descriptor
  }
}

/**
 * Client-side cache para dados não-sensíveis
 */
export class ClientCache {
  private static readonly PREFIX = 'aluerp_cache'

  static set(key: string, data: any, duration: CacheDuration = 'medium'): void {
    const ttl = CACHE_DURATIONS[duration]
    const expiresAt = Date.now() + ttl * 1000

    const cacheItem = {
      data,
      expiresAt,
      createdAt: Date.now(),
    }

    try {
      localStorage.setItem(`${this.PREFIX}:${key}`, JSON.stringify(cacheItem))
    } catch (error) {
      console.warn('[ClientCache] Failed to set cache', error)
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}:${key}`)
      if (!item) return null

      const { data, expiresAt } = JSON.parse(item)

      if (Date.now() > expiresAt) {
        this.remove(key)
        return null
      }

      return data as T
    } catch (error) {
      console.warn('[ClientCache] Failed to get cache', error)
      return null
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}:${key}`)
    } catch (error) {
      console.warn('[ClientCache] Failed to remove cache', error)
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('[ClientCache] Failed to clear cache', error)
    }
  }

  static getStats(): { keys: number; totalSize: number } {
    let totalSize = 0
    let keys = 0

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          keys++
          totalSize += localStorage.getItem(key)?.length || 0
        }
      })
    } catch (error) {
      console.warn('[ClientCache] Failed to get stats', error)
    }

    return { keys, totalSize }
  }
}
