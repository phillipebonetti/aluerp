/**
 * Funções de validação reutilizáveis
 * Validações de negócio e formatação de dados
 */

/**
 * Valida CPF com algoritmo de checksum
 */
export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  
  // Validar comprimento
  if (clean.length !== 11) return false
  
  // Validar se não é sequência repetida
  if (/^(\d)\1{10}$/.test(clean)) return false
  
  // Validar primeiro dígito verificador
  let sum = 0
  let remainder: number
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(clean.substring(9, 10))) return false
  
  // Validar segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(clean.substring(10, 11))) return false
  
  return true
}

/**
 * Valida CNPJ com algoritmo de checksum
 */
export function validateCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '')
  
  // Validar comprimento
  if (clean.length !== 14) return false
  
  // Validar se não é sequência repetida
  if (/^(\d)\1{13}$/.test(clean)) return false
  
  let size = clean.length - 2
  let numbers = clean.substring(0, size)
  let digits = clean.substring(size)
  let sum = 0
  let pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  size = size + 1
  numbers = clean.substring(0, size)
  sum = 0
  pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Valida CEP
 */
export function validateCEP(cep: string): boolean {
  const clean = cep.replace(/\D/g, '')
  return clean.length === 8 && /^\d{8}$/.test(clean)
}

/**
 * Valida Email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida Telefone
 */
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, '')
  return clean.length === 10 || clean.length === 11
}

/**
 * Valida Telefone com WhatsApp
 */
export function validateWhatsApp(phone: string): boolean {
  const clean = phone.replace(/\D/g, '')
  // WhatsApp requer 11 dígitos (55 + DDD + 9 + 4 dígitos)
  return clean.length === 11 || (clean.length === 13 && clean.startsWith('55'))
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valida Data
 */
export function validateDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Valida se é data passada
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * Valida se é data futura
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}

/**
 * Valida força de senha
 */
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score++
  else feedback.push('Mínimo 8 caracteres')
  
  if (password.length >= 12) score++
  
  if (/[a-z]/.test(password)) score++
  else feedback.push('Adicione letras minúsculas')
  
  if (/[A-Z]/.test(password)) score++
  else feedback.push('Adicione letras maiúsculas')
  
  if (/\d/.test(password)) score++
  else feedback.push('Adicione números')
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  else feedback.push('Adicione caracteres especiais')
  
  return {
    score: Math.min(score, 5),
    feedback,
  }
}

/**
 * Valida se dois valores são iguais
 */
export function validateMatch(value1: string, value2: string): boolean {
  return value1 === value2
}

/**
 * Valida comprimento mínimo
 */
export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min
}

/**
 * Valida comprimento máximo
 */
export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max
}

/**
 * Valida valor mínimo
 */
export function validateMin(value: number, min: number): boolean {
  return value >= min
}

/**
 * Valida valor máximo
 */
export function validateMax(value: number, max: number): boolean {
  return value <= max
}

/**
 * Valida se é número
 */
export function validateNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
}

/**
 * Valida se é inteiro
 */
export function validateInteger(value: string): boolean {
  return /^-?\d+$/.test(value)
}

/**
 * Valida se é percentual (0-100)
 */
export function validatePercentage(value: number): boolean {
  return value >= 0 && value <= 100
}

export const validators = {
  cpf: validateCPF,
  cnpj: validateCNPJ,
  cep: validateCEP,
  email: validateEmail,
  phone: validatePhone,
  whatsapp: validateWhatsApp,
  url: validateURL,
  date: validateDate,
  isPastDate,
  isFutureDate,
  passwordStrength: validatePasswordStrength,
  match: validateMatch,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  min: validateMin,
  max: validateMax,
  number: validateNumber,
  integer: validateInteger,
  percentage: validatePercentage,
}
