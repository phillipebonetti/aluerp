/**
 * Formatadores de dados para exibição
 * Converte valores brutos em formatos legíveis
 */

/**
 * Formata número como moeda brasileira (R$)
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

/**
 * Formata data no formato DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/**
 * Formata data e hora no formato DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Formata apenas a hora no formato HH:mm
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Formata percentual com 2 casas decimais
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Formata número com separador de milhares
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formata tamanho de arquivo em bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Formata duração em minutos para HH:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [hours, minutes, secs]
    .map(v => String(v).padStart(2, '0'))
    .join(':')
}

/**
 * Formata telefone para display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

/**
 * Formata CPF para display
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ para display
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata CEP para display
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Formata texto para "title case"
 */
export function formatTitleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Formata texto para "sentence case"
 */
export function formatSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Formata status com label legível
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Ativo',
    'INACTIVE': 'Inativo',
    'PENDING': 'Pendente',
    'APPROVED': 'Aprovado',
    'REJECTED': 'Rejeitado',
    'IN_PROGRESS': 'Em Progresso',
    'COMPLETED': 'Concluído',
    'CANCELLED': 'Cancelado',
    'DRAFT': 'Rascunho',
    'SENT': 'Enviado',
    'ACCEPTED': 'Aceito',
    'EXPIRED': 'Expirado',
  }
  return statusMap[status] || status
}

/**
 * Formata nome de usuário truncando email
 */
export function formatUserName(email: string): string {
  return email.split('@')[0]
}

export const formatters = {
  currency: formatCurrency,
  date: formatDate,
  dateTime: formatDateTime,
  time: formatTime,
  percentage: formatPercentage,
  number: formatNumber,
  fileSize: formatFileSize,
  duration: formatDuration,
  phone: formatPhone,
  cpf: formatCPF,
  cnpj: formatCNPJ,
  cep: formatCEP,
  titleCase: formatTitleCase,
  sentenceCase: formatSentenceCase,
  truncate: truncateText,
  status: formatStatus,
  userName: formatUserName,
}
