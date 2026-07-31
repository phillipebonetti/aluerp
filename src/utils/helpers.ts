/**
 * Funções utilitárias gerais e reutilizáveis
 * Diversos helpers para o projeto
 */

/**
 * Merge de classes CSS
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((c) => typeof c === 'string' && c.length > 0)
    .join(' ')
}

/**
 * Clona um objeto profundamente
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    const clonedArr: any[] = []
    obj.forEach((value) => {
      clonedArr.push(deepClone(value))
    })
    return clonedArr as unknown as T
  }

  if (obj instanceof Object) {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * Mescla dois objetos
 */
export function mergeObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  return {
    ...target,
    ...source,
  }
}

/**
 * Remove propriedades indefinidas de um objeto
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>
}

/**
 * Aguarda por um tempo em ms
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Gera um UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Gera um ID aleatório
 */
export function generateRandomId(length: number = 12): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}

/**
 * Debounce de função
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle de função
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Memoização de função
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Retira duplicatas de array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Retira duplicatas de array de objetos baseado em propriedade
 */
export function removeDuplicatesByKey<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const k = item[key]
    if (seen.has(k)) {
      return false
    }
    seen.add(k)
    return true
  })
}

/**
 * Agrupa array por propriedade
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Ordena array de objetos por propriedade
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

/**
 * Filtra array removendo falsy values
 */
export function compact<T>(array: (T | null | undefined | false)[]): T[] {
  return array.filter((item) => Boolean(item)) as T[]
}

/**
 * Flatten array um nível
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce((flat, item) => {
    return flat.concat(item)
  }, [] as T[])
}

/**
 * Particiona array em chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Retira um item de um array
 */
export function removeItem<T>(array: T[], item: T): T[] {
  return array.filter((i) => i !== item)
}

/**
 * Retira múltiplos items de um array
 */
export function removeItems<T>(array: T[], items: T[]): T[] {
  return array.filter((item) => !items.includes(item))
}

/**
 * Insere item em posição específica
 */
export function insertAt<T>(array: T[], index: number, item: T): T[] {
  const newArray = [...array]
  newArray.splice(index, 0, item)
  return newArray
}

/**
 * Substitui item em array
 */
export function replaceItem<T>(array: T[], index: number, item: T): T[] {
  const newArray = [...array]
  newArray[index] = item
  return newArray
}

/**
 * Inverte ordem de array
 */
export function reverseArray<T>(array: T[]): T[] {
  return [...array].reverse()
}

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Lê texto do clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText()
  } catch {
    return null
  }
}

/**
 * Baixa arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Abre URL em nova aba
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank')
}

/**
 * Copia URL atual para clipboard
 */
export async function shareCurrentURL(): Promise<boolean> {
  return copyToClipboard(window.location.href)
}

export const helpers = {
  cn,
  deepClone,
  mergeObjects,
  removeUndefined,
  delay,
  generateUUID,
  generateRandomId,
  debounce,
  throttle,
  memoize,
  removeDuplicates,
  removeDuplicatesByKey,
  groupBy,
  sortBy,
  compact,
  flatten,
  chunk,
  removeItem,
  removeItems,
  insertAt,
  replaceItem,
  reverseArray,
  copyToClipboard,
  readFromClipboard,
  downloadFile,
  openInNewTab,
  shareCurrentURL,
}
