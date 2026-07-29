/**
 * Compras Repository
 * Camada de acesso a dados para o módulo Compras
 */

import { BaseRepository } from '@/repositories'
import type { ComprasRequisicao, ComprasCotacao, ComprasPedido, ComprasRecebimento } from '../types'

export class ComprasRepository extends BaseRepository {
  /**
   * Requisições
   */
  async getRequisicoes(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  async getRequisicaoById(id: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Cotações
   */
  async getCotacoes(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  async getCotacoesByRequisicao(requisicaoId: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Pedidos
   */
  async getPedidos(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Recebimentos
   */
  async getRecebimentos(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }
}
