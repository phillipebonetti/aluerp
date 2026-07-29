/**
 * Estoque Module Types
 * Tipos e interfaces para o módulo de Gestão de Estoque
 */

export interface EstoqueProduto {
  id: string
  companyId: string
  codigo: string
  nome: string
  descricao?: string
  quantidade: number
  quantidadeMinima: number
  quantidadeMaxima: number
  preco: number
  unidade: string
  deposito: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EstoqueMovimentacao {
  id: string
  companyId: string
  produtoId: string
  tipo: 'entrada' | 'saída' | 'ajuste' | 'transferência'
  quantidade: number
  depositoOrigem: string
  depositoDestino?: string
  motivo: string
  referencia?: string
  createdBy: string
  createdAt: Date
}

export interface EstoqueAjuste {
  id: string
  companyId: string
  produtoId: string
  quantidadeAnterior: number
  quantidadeNova: number
  motivo: string
  realizado: string
  createdAt: Date
}

export interface EstoqueAlerta {
  id: string
  companyId: string
  produtoId: string
  tipo: 'minimo' | 'maximo' | 'vencimento'
  mensagem: string
  resolvido: boolean
  createdAt: Date
}
