/**
 * Utilitários para manipulação e cálculo de datas
 * Sem dependências externas
 */

/**
 * Adiciona dias a uma data
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtrai dias de uma data
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days)
}

/**
 * Adiciona meses a uma data
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Adiciona anos a uma data
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay)
}

/**
 * Calcula a diferença em horas entre duas datas
 */
export function hoursBetween(startDate: Date, endDate: Date): number {
  const msPerHour = 60 * 60 * 1000
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerHour)
}

/**
 * Calcula a diferença em minutos entre duas datas
 */
export function minutesBetween(startDate: Date, endDate: Date): number {
  const msPerMinute = 60 * 1000
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerMinute)
}

/**
 * Retorna o início do dia
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Retorna o fim do dia
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Retorna o início da semana (segunda)
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1)
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Retorna o fim da semana (domingo)
 */
export function endOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? 0 : 7)
  result.setDate(diff)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Retorna o início do mês
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Retorna o fim do mês
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1)
  result.setDate(0)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Retorna o início do ano
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date)
  result.setMonth(0)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Retorna o fim do ano
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date)
  result.setMonth(11)
  result.setDate(31)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Verifica se é o mesmo dia
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Verifica se é o mesmo mês
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  )
}

/**
 * Verifica se é o mesmo ano
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
}

/**
 * Verifica se é fim de semana
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Verifica se é dia de semana
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date)
}

/**
 * Retorna dias úteis entre duas datas
 */
export function businessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    if (isWeekday(currentDate)) {
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return count
}

/**
 * Retorna o nome do mês
 */
export function getMonthName(date: Date, locale: string = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
}

/**
 * Retorna o nome do dia da semana
 */
export function getDayName(date: Date, locale: string = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
}

/**
 * Retorna o numero de dias no mês
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Retorna a idade em anos
 */
export function getAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Formata duração entre duas datas em texto legível
 */
export function formatDurationBetween(startDate: Date, endDate: Date): string {
  const totalSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  
  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  } else if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60)
    return `${minutes}m`
  } else if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600)
    return `${hours}h`
  } else {
    const days = Math.floor(totalSeconds / 86400)
    return `${days}d`
  }
}

/**
 * Retorna se uma data é válida
 */
export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Parse ISO string para Date
 */
export function parseISO(dateString: string): Date | null {
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}

/**
 * Converte string DD/MM/YYYY para Date
 */
export function parseBrazilianDate(dateString: string): Date | null {
  const [day, month, year] = dateString.split('/').map(Number)
  
  if (!day || !month || !year) return null
  
  const date = new Date(year, month - 1, day)
  
  if (date.getDate() !== day || date.getMonth() !== month - 1) {
    return null // Data inválida
  }
  
  return date
}

export const dateUtils = {
  addDays,
  subtractDays,
  addMonths,
  addYears,
  daysBetween,
  hoursBetween,
  minutesBetween,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isWeekend,
  isWeekday,
  businessDaysBetween,
  getMonthName,
  getDayName,
  getDaysInMonth,
  getAge,
  formatDurationBetween,
  isValidDate,
  parseISO,
  parseBrazilianDate,
}
