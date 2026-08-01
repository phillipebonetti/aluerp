'use server'

import { prisma } from '@/lib/prisma'
import { MaterialService } from '@/src/lib/services/os-materials-service'
import { CreateOSMaterialSchema, UpdateOSMaterialSchema, UpdateMaterialStatusSchema } from '@/src/lib/schemas/os-1b'
import type { CreateOSMaterial, UpdateOSMaterial, UpdateMaterialStatus } from '@/src/lib/schemas/os-1b'

export async function createMaterial(data: CreateOSMaterial) {
  try {
    const validated = CreateOSMaterialSchema.parse(data)
    return await MaterialService.createMaterial(validated)
  } catch (error) {
    console.error('[OS Materials] Create error:', error)
    throw new Error('Erro ao criar material')
  }
}

export async function updateMaterial(id: string, data: UpdateOSMaterial) {
  try {
    const validated = UpdateOSMaterialSchema.parse({ id, ...data })
    const { id: _, ...updateData } = validated
    return await MaterialService.updateMaterial(id, updateData as any)
  } catch (error) {
    console.error('[OS Materials] Update error:', error)
    throw new Error('Erro ao atualizar material')
  }
}

export async function deleteMaterial(id: string) {
  try {
    return await MaterialService.deleteMaterial(id)
  } catch (error) {
    console.error('[OS Materials] Delete error:', error)
    throw new Error('Erro ao deletar material')
  }
}

export async function listMaterials(serviceOrderId: string) {
  try {
    return await MaterialService.listMaterials(serviceOrderId)
  } catch (error) {
    console.error('[OS Materials] List error:', error)
    throw new Error('Erro ao listar materiais')
  }
}

export async function getMaterialsStats(serviceOrderId: string) {
  try {
    return await MaterialService.getMaterialsStats(serviceOrderId)
  } catch (error) {
    console.error('[OS Materials] Stats error:', error)
    throw new Error('Erro ao obter estatísticas')
  }
}

export async function markMaterialAsReceived(id: string, receivedQty: number) {
  try {
    const validated = UpdateMaterialStatusSchema.parse({
      id,
      status: 'RECEIVED',
      receivedQty,
    })
    return await MaterialService.markAsReceived(validated.id, validated.receivedQty!)
  } catch (error) {
    console.error('[OS Materials] Mark received error:', error)
    throw new Error('Erro ao marcar material como recebido')
  }
}

export async function markMaterialAsPartial(id: string, receivedQty: number) {
  try {
    return await MaterialService.markAsPartial(id, receivedQty)
  } catch (error) {
    console.error('[OS Materials] Mark partial error:', error)
    throw new Error('Erro ao marcar material como parcial')
  }
}

export async function autoCalculateMaterials(serviceOrderId: string) {
  try {
    // This is a placeholder for bill of materials integration
    // For now, just return existing materials
    return await MaterialService.autoCalculateMaterials(serviceOrderId)
  } catch (error) {
    console.error('[OS Materials] Auto-calculate error:', error)
    throw new Error('Erro ao calcular materiais automaticamente')
  }
}

export async function getTotalMaterialsCost(serviceOrderId: string) {
  try {
    return await MaterialService.getTotalMaterialsCost(serviceOrderId)
  } catch (error) {
    console.error('[OS Materials] Total cost error:', error)
    throw new Error('Erro ao calcular custo total')
  }
}

export async function checkAllMaterialsReceived(serviceOrderId: string) {
  try {
    return await MaterialService.areAllMaterialsReceived(serviceOrderId)
  } catch (error) {
    console.error('[OS Materials] Check received error:', error)
    throw new Error('Erro ao verificar recebimento')
  }
}
