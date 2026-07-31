/**
 * Exportações centralizadas de todos os utilitários
 * 
 * Importar:
 * import { formatCurrency, maskPhone, validateCPF } from '@/src/utils'
 */

// Formatadores
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatPercentage,
  formatNumber,
  formatFileSize,
  formatDuration,
  formatPhone,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatTitleCase,
  formatSentenceCase,
  truncateText,
  formatStatus,
  formatUserName,
  formatters,
} from './formatters'

// Máscaras para inputs
export {
  maskCPF,
  maskCNPJ,
  maskCEP,
  maskPhone,
  maskCurrency,
  maskPercentage,
  maskNumeric,
  maskAlpha,
  maskAlphanumeric,
  maskDate,
  maskTime,
  maskCreditCard,
  masks,
} from './masks'

// Validações
export {
  validateCPF,
  validateCNPJ,
  validateCEP,
  validateEmail,
  validatePhone,
  validateWhatsApp,
  validateURL,
  validateDate,
  isPastDate,
  isFutureDate,
  validatePasswordStrength,
  validateMatch,
  validateMinLength,
  validateMaxLength,
  validateMin,
  validateMax,
  validateNumber,
  validateInteger,
  validatePercentage,
  validators,
} from './validations'

// Utilitários de data
export {
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
  dateUtils,
} from './dates'

// Remove máscaras
export {
  unmaskCPF,
  unmaskCNPJ,
  unmaskCEP,
  unmaskPhone,
  unmaskDate,
  unmaskCurrency,
  unmaskCurrencyToCents,
  unmaskPercentage,
  unmaskCreditCard,
  unmaskTime,
  removeSpecialChars,
  cleanWhitespace,
  unmask,
} from './unmask'

// Helpers gerais
export {
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
  helpers,
} from './helpers'
