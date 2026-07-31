/**
 * Helpers Centralizados do AluERP
 * 
 * Funções reutilizáveis de negócio compartilhadas entre
 * services, componentes, hooks e APIs
 */

/**
 * Formata erro para resposta de API
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  return {
    message: 'Erro desconhecido',
    error: String(error),
  }
}

/**
 * Valida se usuário tem acesso ao recurso
 */
export function validateResourceAccess(
  resourceCompanyId: string,
  userCompanyId: string,
  userRole?: string
): boolean {
  // Owner/Admin pode acessar tudo
  if (userRole === 'OWNER' || userRole === 'ADMIN') {
    return true
  }

  // Outros usuários só acessam recursos da sua empresa
  return resourceCompanyId === userCompanyId
}

/**
 * Valida datas de períodos
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  if (startDate >= endDate) {
    return false
  }

  // Máximo de 1 ano
  const maxDays = 365
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return days <= maxDays
}

/**
 * Calcula pagamento com desconto/acréscimo
 */
export function calculatePaymentAmount(
  baseAmount: number,
  discount?: number,
  tax?: number
): {
  baseAmount: number
  discount: number
  tax: number
  totalAmount: number
} {
  const discountAmount = discount ? baseAmount * (discount / 100) : 0
  const taxableAmount = baseAmount - discountAmount
  const taxAmount = tax ? taxableAmount * (tax / 100) : 0
  const totalAmount = taxableAmount + taxAmount

  return {
    baseAmount,
    discount: discountAmount,
    tax: taxAmount,
    totalAmount,
  }
}

/**
 * Agrupa dados por chave
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Suma valores de um array
 */
export function sum<T>(array: T[], getValue: (item: T) => number): number {
  return array.reduce((total, item) => total + getValue(item), 0)
}

/**
 * Calcula média
 */
export function average<T>(array: T[], getValue: (item: T) => number): number {
  if (array.length === 0) return 0
  return sum(array, getValue) / array.length
}

/**
 * Encontra item e retorna índice
 */
export function findIndex<T>(
  array: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i
    }
  }
  return -1
}

/**
 * Cria URL de query com parâmetros
 */
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

/**
 * Delay assíncrono
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Validação de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitiza string
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
}

/**
 * Gera slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}
