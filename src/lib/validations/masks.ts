/**
 * Máscaras e formatadores para inputs
 * Utilizadas com React Hook Form
 */

export const masks = {
  // CPF: 123.456.789-00
  cpf: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2')
      .slice(0, 14)
  },

  // CNPJ: 12.345.678/0001-90
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  },

  // CEP: 12345-678
  cep: (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
  },

  // Telefone: (12) 34567-8901 ou (12) 3456-7890
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3').slice(0, 14)
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3').slice(0, 15)
  },

  // Moeda: 1.234,56
  currency: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return '0,00'
    const formatted = (parseInt(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatted
  },

  // Percentual
  percentage: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return Math.min(Math.max(parseInt(numbers) || 0, 0), 100).toString()
  },

  // Apenas números
  numeric: (value: string) => {
    return value.replace(/\D/g, '')
  },

  // Apenas letras e espaços
  alpha: (value: string) => {
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
  },

  // Alpanumérico
  alphanumeric: (value: string) => {
    return value.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
  },
}

// Funções de validação de masks
export const validateMasks = {
  cpf: (value: string): boolean => {
    const cpf = value.replace(/\D/g, '')
    if (cpf.length !== 11) return false
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cpf)) return false
    return true
  },

  cnpj: (value: string): boolean => {
    const cnpj = value.replace(/\D/g, '')
    if (cnpj.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cnpj)) return false
    return true
  },

  phone: (value: string): boolean => {
    const phone = value.replace(/\D/g, '')
    return phone.length === 10 || phone.length === 11
  },

  cep: (value: string): boolean => {
    const cep = value.replace(/\D/g, '')
    return cep.length === 8
  },
}

// Removedores de máscara
export const unmask = {
  cpf: (value: string) => value.replace(/\D/g, ''),
  cnpj: (value: string) => value.replace(/\D/g, ''),
  cep: (value: string) => value.replace(/\D/g, ''),
  phone: (value: string) => value.replace(/\D/g, ''),
  currency: (value: string) => {
    const num = value.replace(/\D/g, '')
    return (parseInt(num) / 100).toString()
  },
}

// Formatadores gerais
export const formatters = {
  // Formata número como moeda
  currency: (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '') || '0') / 100 : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  },

  // Formata data
  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR').format(d)
  },

  // Formata data e hora
  datetime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d)
  },

  // Formata percentual
  percentage: (value: number): string => {
    return `${(value * 100).toFixed(2)}%`
  },
}
