import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'
import type { OSMaterial, MaterialStatus, MaterialCategory } from '@/src/types/os'

export class MaterialService {
  /**
   * Criar novo material
   */
  static async createMaterial(data: {
    serviceOrderId: string
    sequence: number
    name: string
    category: MaterialCategory
    description?: string
    quantity: number
    unit: string
    unitCost: number
    supplier?: string
    notes?: string
  }) {
    const totalCost = new Decimal(data.quantity).times(new Decimal(data.unitCost))

    return await prisma.oSMaterial.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        sequence: data.sequence,
        name: data.name,
        category: data.category,
        description: data.description,
        quantity: new Decimal(data.quantity),
        unit: data.unit,
        unitCost: new Decimal(data.unitCost),
        totalCost: totalCost,
        supplier: data.supplier,
        notes: data.notes,
      },
    })
  }

  /**
   * Atualizar material
   */
  static async updateMaterial(
    id: string,
    data: Partial<{
      name: string
      category: MaterialCategory
      description: string
      quantity: number
      unit: string
      unitCost: number
      supplier: string
      status: MaterialStatus
      purchaseDate: Date
      receivedDate: Date
      receivedQty: number
      notes: string
    }>
  ) {
    const updateData: any = { ...data }

    // Recalculate total if quantity or unit cost changed
    if (data.quantity !== undefined || data.unitCost !== undefined) {
      const material = await prisma.oSMaterial.findUnique({ where: { id } })
      if (material) {
        const qty = data.quantity ?? material.quantity
        const cost = data.unitCost ?? material.unitCost
        updateData.totalCost = new Decimal(qty).times(new Decimal(cost))
      }
    }

    // Convert decimals
    if (data.quantity) updateData.quantity = new Decimal(data.quantity)
    if (data.unitCost) updateData.unitCost = new Decimal(data.unitCost)
    if (data.receivedQty) updateData.receivedQty = new Decimal(data.receivedQty)

    return await prisma.oSMaterial.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Deletar material
   */
  static async deleteMaterial(id: string) {
    return await prisma.oSMaterial.delete({
      where: { id },
    })
  }

  /**
   * Listar materiais de uma OS
   */
  static async listMaterials(serviceOrderId: string) {
    return await prisma.oSMaterial.findMany({
      where: { serviceOrderId },
      orderBy: { sequence: 'asc' },
    })
  }

  /**
   * Calcular custo total de materiais
   */
  static async getTotalMaterialsCost(serviceOrderId: string): Promise<number> {
    const result = await prisma.oSMaterial.aggregate({
      where: { serviceOrderId },
      _sum: { totalCost: true },
    })

    return result._sum.totalCost ? Number(result._sum.totalCost) : 0
  }

  /**
   * Obter estatísticas de materiais
   */
  static async getMaterialsStats(serviceOrderId: string) {
    const materials = await this.listMaterials(serviceOrderId)

    const stats = {
      total: materials.length,
      pending: materials.filter((m) => m.status === 'PENDING').length,
      purchased: materials.filter((m) => m.status === 'PURCHASED').length,
      received: materials.filter((m) => m.status === 'RECEIVED').length,
      partial: materials.filter((m) => m.status === 'PARTIAL').length,
      cancelled: materials.filter((m) => m.status === 'CANCELLED').length,
      totalCost: await this.getTotalMaterialsCost(serviceOrderId),
      byCategory: {
        aluminio: materials.filter((m) => m.category === 'ALUMINIO').length,
        vidro: materials.filter((m) => m.category === 'VIDRO').length,
        ferragens: materials.filter((m) => m.category === 'FERRAGENS').length,
        acessorios: materials.filter((m) => m.category === 'ACESSORIOS').length,
        outros: materials.filter((m) => m.category === 'OUTROS').length,
      },
    }

    return stats
  }

  /**
   * Marcar material como recebido
   */
  static async markAsReceived(id: string, receivedQty: number, receivedDate: Date = new Date()) {
    return await this.updateMaterial(id, {
      status: 'RECEIVED',
      receivedDate,
      receivedQty,
    })
  }

  /**
   * Marcar material como parcialmente recebido
   */
  static async markAsPartial(id: string, receivedQty: number) {
    return await this.updateMaterial(id, {
      status: 'PARTIAL',
      receivedQty,
    })
  }

  /**
   * Auto-calcular materiais baseado em produtos da OS
   * (placeholder para integração futura com bill of materials)
   */
  static async autoCalculateMaterials(serviceOrderId: string) {
    // This would integrate with a bill of materials or
    // automatically suggest materials based on products
    // For now, just return existing materials
    return await this.listMaterials(serviceOrderId)
  }

  /**
   * Verificar se todos os materiais foram recebidos
   */
  static async areAllMaterialsReceived(serviceOrderId: string): Promise<boolean> {
    const materials = await this.listMaterials(serviceOrderId)

    if (materials.length === 0) return true

    return materials.every((m) => m.status === 'RECEIVED' || m.status === 'CANCELLED')
  }
}
