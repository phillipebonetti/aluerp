/**
 * Funções para remover máscaras de dados formatados
 * Retorna dados brutos para envio ao servidor
 */

/**
 * Remove máscara de CPF
 */
export function unmaskCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Remove máscara de CNPJ
 */
export function unmaskCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Remove máscara de CEP
 */
export function unmaskCEP(cep: string): string {
  return cep.replace(/\D/g, '')
}

/**
 * Remove máscara de Telefone
 */
export function unmaskPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Remove máscara de Data
 */
export function unmaskDate(date: string): string {
  return date.replace(/\D/g, '')
}

/**
 * Remove máscara de Moeda e retorna como número
 */
export function unmaskCurrency(currency: string): number {
  const clean = currency.replace(/\D/g, '')
  return clean ? parseInt(clean) / 100 : 0
}

/**
 * Remove máscara de Moeda e retorna como string de centavos
 */
export function unmaskCurrencyToCents(currency: string): string {
  return currency.replace(/\D/g, '')
}

/**
 * Remove máscara de Percentual
 */
export function unmaskPercentage(percentage: string): number {
  return parseInt(percentage.replace(/\D/g, '')) || 0
}

/**
 * Remove máscara de Cartão de Crédito
 */
export function unmaskCreditCard(card: string): string {
  return card.replace(/\D/g, '')
}

/**
 * Remove máscara de Hora
 */
export function unmaskTime(time: string): string {
  return time.replace(/\D/g, '')
}

/**
 * Remove todos os caracteres especiais de uma string
 */
export function removeSpecialChars(text: string): string {
  return text.replace(/[^\w\s]/gi, '')
}

/**
 * Remove espaços em branco desnecessários
 */
export function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export const unmask = {
  cpf: unmaskCPF,
  cnpj: unmaskCNPJ,
  cep: unmaskCEP,
  phone: unmaskPhone,
  date: unmaskDate,
  currency: unmaskCurrency,
  currencyToCents: unmaskCurrencyToCents,
  percentage: unmaskPercentage,
  creditCard: unmaskCreditCard,
  time: unmaskTime,
  specialChars: removeSpecialChars,
  whitespace: cleanWhitespace,
}
