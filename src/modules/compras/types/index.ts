/**
 * Compras Module Types
 * Tipos e interfaces para o módulo de Gestão de Compras
 */

export interface ComprasRequisicao {
  id: string
  companyId: string
  numero: string
  solicitante: string
  status: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada' | 'cancelada'
  dataRequisicao: Date
  dataPrevista: Date
  departamento: string
  createdAt: Date
  updatedAt: Date
}

export interface ComprasCotacao {
  id: string
  companyId: string
  requisicaoId: string
  numero: string
  fornecedorId: string
  dataValidade: Date
  status: 'enviada' | 'recebida' | 'selecionada' | 'cancelada'
  itens: ComprasCotacaoItem[]
  createdAt: Date
}

export interface ComprasCotacaoItem {
  id: string
  cotacaoId: string
  produtoId: string
  quantidade: number
  preco: number
  total: number
}

export interface ComprasPedido {
  id: string
  companyId: string
  numero: string
  fornecedorId: string
  dataPedido: Date
  dataEntregaPrevista: Date
  status: 'rascunho' | 'emitido' | 'aceito' | 'entregue' | 'cancelado'
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface ComprasRecebimento {
  id: string
  companyId: string
  pedidoId: string
  dataRecebimento: Date
  nfNumero: string
  status: 'pendente' | 'parcial' | 'completo'
  createdAt: Date
}
