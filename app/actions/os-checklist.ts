'use server'

import { prisma } from '@/lib/prisma'
import { ChecklistItemSchema, CreateChecklistSchema, UpdateChecklistItemSchema } from '@/src/lib/schemas/os-1b'
import type { ChecklistItem, UpdateChecklistItem } from '@/src/lib/schemas/os-1b'

export async function createChecklist(
  serviceOrderId: string,
  items: Partial<ChecklistItem>[]
) {
  try {
    const validated = CreateChecklistSchema.parse({
      serviceOrderId,
      items: items.map((item) => ({
        id: item.id || `temp-${Date.now()}-${Math.random()}`,
        title: item.title || '',
        description: item.description,
        completed: item.completed || false,
      })),
    })

    // Store checklist in JSON or separate table
    // For now, returning validated data
    return validated.items
  } catch (error) {
    console.error('[OS Checklist] Create error:', error)
    throw new Error('Erro ao criar checklist')
  }
}

export async function updateChecklistItem(id: string, data: UpdateChecklistItem) {
  try {
    const validated = UpdateChecklistItemSchema.parse({
      id,
      completed: data.completed,
      photoUrl: data.photoUrl,
      notes: data.notes,
    })

    // Update checklist item
    // This would be stored in OS metadata or separate table
    return {
      id: validated.id,
      completed: validated.completed,
      completedAt: validated.completed ? new Date() : undefined,
      photoUrl: validated.photoUrl,
      notes: validated.notes,
    }
  } catch (error) {
    console.error('[OS Checklist] Update error:', error)
    throw new Error('Erro ao atualizar checklist')
  }
}

export async function deleteChecklistItem(serviceOrderId: string, itemId: string) {
  try {
    // Remove item from checklist
    console.log(`[OS Checklist] Deleting item ${itemId} from OS ${serviceOrderId}`)
    return { success: true }
  } catch (error) {
    console.error('[OS Checklist] Delete error:', error)
    throw new Error('Erro ao deletar item do checklist')
  }
}

export async function uploadChecklistPhoto(itemId: string, file: File) {
  try {
    if (!file) throw new Error('Arquivo não fornecido')

    // TODO: Implement file upload to storage
    // For now, return placeholder URL
    const fileName = `checklist-${itemId}-${Date.now()}.jpg`
    const photoUrl = `/uploads/checklist/${fileName}`

    return {
      itemId,
      photoUrl,
      fileName,
      uploadedAt: new Date(),
    }
  } catch (error) {
    console.error('[OS Checklist] Upload photo error:', error)
    throw new Error('Erro ao fazer upload de foto')
  }
}

export async function getChecklistProgress(serviceOrderId: string) {
  try {
    // Get OS data and calculate checklist progress
    const os = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      select: {
        id: true,
        number: true,
        status: true,
      },
    })

    if (!os) throw new Error('OS não encontrada')

    // This would be calculated from stored checklist data
    return {
      serviceOrderId,
      total: 0,
      completed: 0,
      percentage: 0,
      items: [],
    }
  } catch (error) {
    console.error('[OS Checklist] Get progress error:', error)
    throw new Error('Erro ao obter progresso do checklist')
  }
}

export async function completeChecklistItem(
  itemId: string,
  completedBy: string,
  photoUrl?: string,
  notes?: string
) {
  try {
    return {
      itemId,
      completed: true,
      completedBy,
      completedAt: new Date(),
      photoUrl,
      notes,
    }
  } catch (error) {
    console.error('[OS Checklist] Complete item error:', error)
    throw new Error('Erro ao marcar item como concluído')
  }
}

export async function bulkUpdateChecklist(serviceOrderId: string, updates: Record<string, UpdateChecklistItem>) {
  try {
    const results = {}

    for (const [itemId, data] of Object.entries(updates)) {
      const validated = UpdateChecklistItemSchema.parse({
        id: itemId,
        ...data,
      })
      Object.assign(results, { [itemId]: validated })
    }

    return results
  } catch (error) {
    console.error('[OS Checklist] Bulk update error:', error)
    throw new Error('Erro ao atualizar múltiplos itens')
  }
}
