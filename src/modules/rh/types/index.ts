/**
 * RH Module Types
 * Tipos e interfaces para o módulo de Gestão de Recursos Humanos
 */

export interface RHFuncionario {
  id: string
  companyId: string
  nome: string
  email: string
  cpf: string
  dataAdmissao: Date
  dataDemissao?: Date
  cargo: string
  departamento: string
  salario: number
  status: 'ativo' | 'afastado' | 'desligado'
  createdAt: Date
  updatedAt: Date
}

export interface RHFolhaPagamento {
  id: string
  companyId: string
  funcionarioId: string
  mes: number
  ano: number
  salarioBruto: number
  descontos: number
  adicional: number
  liquido: number
  status: 'aberta' | 'processada' | 'paga'
  dataPagamento?: Date
}

export interface RHFerias {
  id: string
  companyId: string
  funcionarioId: string
  dataInicio: Date
  dataFim: Date
  dias: number
  status: 'planejada' | 'confirmada' | 'concluída'
  createdAt: Date
}

export interface RHBeneficio {
  id: string
  companyId: string
  funcionarioId: string
  tipo: 'saude' | 'dental' | 'vale_refeicao' | 'vale_transporte' | 'outro'
  valor: number
  dataInicio: Date
  dataFim?: Date
  ativo: boolean
}

export interface RHAvaliacao {
  id: string
  companyId: string
  funcionarioId: string
  avaliador: string
  dataAvaliacao: Date
  periodo: string
  desempenho: number // 1-5
  competencias: Record<string, number>
  observacoes?: string
}
