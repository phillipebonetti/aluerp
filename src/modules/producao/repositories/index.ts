/**
 * Produção Repository
 * Camada de acesso a dados para o módulo Produção
 */

import { BaseRepository } from '@/repositories'
import type { ProducaoOrdem, ProducaoOperacao, ProducaoRecurso, ProducaoQualidade } from '../types'

export class ProducaoRepository extends BaseRepository {
  /**
   * Ordens de Produção
   */
  async getOrdens(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  async getOrdemById(id: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Operações
   */
  async getOperacoes(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Recursos
   */
  async getRecursos(companyId: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Qualidade
   */
  async getVerificacoes(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }
}
