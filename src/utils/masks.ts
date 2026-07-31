/**
 * Máscaras e formatadores para inputs
 * Utilizadas com React Hook Form e onChange handlers
 */

/**
 * Máscara para CPF: 123.456.789-00
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2')
    .slice(0, 14)
}

/**
 * Máscara para CNPJ: 12.345.678/0001-90
 */
export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

/**
 * Máscara para CEP: 12345-678
 */
export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

/**
 * Máscara para Telefone: (12) 34567-8901 ou (12) 3456-7890
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3')
      .slice(0, 14)
  }
  return cleaned
    .replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3')
    .slice(0, 15)
}

/**
 * Máscara para Moeda: 1.234,56
 */
export function maskCurrency(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return '0,00'
  
  const formatted = (parseInt(numbers) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatted
}

/**
 * Máscara para Percentual (0-100)
 */
export function maskPercentage(value: string): string {
  const numbers = value.replace(/\D/g, '')
  const num = Math.min(Math.max(parseInt(numbers) || 0, 0), 100)
  return num.toString()
}

/**
 * Máscara para Apenas Números
 */
export function maskNumeric(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Máscara para Apenas Letras e Espaços
 */
export function maskAlpha(value: string): string {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
}

/**
 * Máscara para Alfanumérico
 */
export function maskAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
}

/**
 * Máscara para Data: DD/MM/YYYY
 */
export function maskDate(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10)
}

/**
 * Máscara para Hora: HH:mm
 */
export function maskTime(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{2})(\d)/, '$1:$2')
    .slice(0, 5)
}

/**
 * Máscara para Cartão de Crédito
 */
export function maskCreditCard(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .slice(0, 19)
}

export const masks = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  cep: maskCEP,
  phone: maskPhone,
  currency: maskCurrency,
  percentage: maskPercentage,
  numeric: maskNumeric,
  alpha: maskAlpha,
  alphanumeric: maskAlphanumeric,
  date: maskDate,
  time: maskTime,
  creditCard: maskCreditCard,
}
