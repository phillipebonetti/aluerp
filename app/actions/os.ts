'use server'

import { prisma } from '@/lib/prisma'
import { OSService } from '@/src/lib/services/os-service'
import { CreateOSSchema, UpdateOSSchema, CreateOSProductSchema, CreateProductionStageSchema, UpdateProductionStageSchema, CreateInstallationSchema, CreateCommentSchema, OSListFiltersSchema, BulkChangeStatusSchema, DuplicateOSSchema } from '@/src/lib/schemas/os'
import type { CreateOSInput, UpdateOSInput, CreateOSProductInput, CreateProductionStageInput, UpdateProductionStageInput, CreateInstallationInput, CreateCommentInput, OSListFiltersInput, BulkChangeStatusInput, DuplicateOSInput } from '@/src/types/os'
import { Decimal } from 'decimal.js'

// CRUD Operations
export async function createServiceOrder(companyId: string, input: unknown) {
  try {
    const data = CreateOSSchema.parse(input)
    return await OSService.createServiceOrder(companyId, {
      ...data,
      createdBy: 'system', // TODO: get from auth context
    })
  } catch (error) {
    console.error('[OS] Create error:', error)
    throw error
  }
}

export async function updateServiceOrder(id: string, input: unknown) {
  try {
    const data = UpdateOSSchema.parse(input)
    return await prisma.serviceOrder.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: 'system', // TODO: get from auth context
      },
      include: {
        client: true,
        project: true,
        vendedor: true,
      },
    })
  } catch (error) {
    console.error('[OS] Update error:', error)
    throw error
  }
}

export async function deleteServiceOrder(id: string) {
  try {
    return await OSService.deleteServiceOrder(id)
  } catch (error) {
    console.error('[OS] Delete error:', error)
    throw error
  }
}

export async function getServiceOrder(id: string) {
  try {
    return await OSService.getServiceOrderById(id)
  } catch (error) {
    console.error('[OS] Get error:', error)
    throw error
  }
}

export async function listServiceOrders(companyId: string, input: unknown) {
  try {
    const filters = OSListFiltersSchema.parse(input)
    return await OSService.listServiceOrders(companyId, filters)
  } catch (error) {
    console.error('[OS] List error:', error)
    throw error
  }
}

// Status Management
export async function changeServiceOrderStatus(id: string, status: string) {
  try {
    if (!['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(status)) {
      throw new Error('Status inválido')
    }
    return await OSService.updateStatus(id, status as any, 'system')
  } catch (error) {
    console.error('[OS] Change status error:', error)
    throw error
  }
}

export async function bulkChangeStatus(input: unknown) {
  try {
    const data = BulkChangeStatusSchema.parse(input)
    const updates = await Promise.all(
      data.osIds.map((osId) => OSService.updateStatus(osId, data.status, 'system'))
    )
    return updates
  } catch (error) {
    console.error('[OS] Bulk change status error:', error)
    throw error
  }
}

// Products
export async function addOSProduct(serviceOrderId: string, input: unknown) {
  try {
    const data = CreateOSProductSchema.parse(input)
    
    // Calculate area if width and height are provided
    let area: Decimal | undefined
    if (data.width && data.height) {
      area = new Decimal(data.width * data.height)
    }

    const totalValue = new Decimal(data.quantity * data.unitValue)

    return await prisma.oSProduct.create({
      data: {
        serviceOrderId,
        sequence: data.sequence,
        description: data.description,
        quantity: new Decimal(data.quantity),
        width: data.width ? new Decimal(data.width) : undefined,
        height: data.height ? new Decimal(data.height) : undefined,
        area,
        unitValue: new Decimal(data.unitValue),
        totalValue,
        notes: data.notes,
      },
    })
  } catch (error) {
    console.error('[OS Product] Create error:', error)
    throw error
  }
}

export async function updateOSProduct(productId: string, input: unknown) {
  try {
    const data = CreateOSProductSchema.parse(input)
    
    let area: Decimal | undefined
    if (data.width && data.height) {
      area = new Decimal(data.width * data.height)
    }

    const totalValue = new Decimal(data.quantity * data.unitValue)

    return await prisma.oSProduct.update({
      where: { id: productId },
      data: {
        sequence: data.sequence,
        description: data.description,
        quantity: new Decimal(data.quantity),
        width: data.width ? new Decimal(data.width) : undefined,
        height: data.height ? new Decimal(data.height) : undefined,
        area,
        unitValue: new Decimal(data.unitValue),
        totalValue,
        notes: data.notes,
      },
    })
  } catch (error) {
    console.error('[OS Product] Update error:', error)
    throw error
  }
}

export async function deleteOSProduct(productId: string) {
  try {
    return await prisma.oSProduct.delete({
      where: { id: productId },
    })
  } catch (error) {
    console.error('[OS Product] Delete error:', error)
    throw error
  }
}

// Production Stages
export async function addProductionStage(serviceOrderId: string, input: unknown) {
  try {
    const data = CreateProductionStageSchema.parse(input)
    return await prisma.oSProductionStage.create({
      data: {
        serviceOrderId,
        sequence: data.sequence,
        name: data.name,
        status: 'PENDING',
        responsibleId: data.responsibleId,
        notes: data.notes,
      },
      include: { responsible: true },
    })
  } catch (error) {
    console.error('[Production Stage] Create error:', error)
    throw error
  }
}

export async function updateProductionStage(stageId: string, input: unknown) {
  try {
    const data = UpdateProductionStageSchema.parse(input)
    return await prisma.oSProductionStage.update({
      where: { id: stageId },
      data,
      include: { responsible: true },
    })
  } catch (error) {
    console.error('[Production Stage] Update error:', error)
    throw error
  }
}

export async function deleteProductionStage(stageId: string) {
  try {
    return await prisma.oSProductionStage.delete({
      where: { id: stageId },
    })
  } catch (error) {
    console.error('[Production Stage] Delete error:', error)
    throw error
  }
}

// Installations
export async function addInstallation(serviceOrderId: string, input: unknown) {
  try {
    const data = CreateInstallationSchema.parse(input)
    return await prisma.oSInstallation.create({
      data: {
        serviceOrderId,
        sequence: 1,
        teamLeadId: data.teamLeadId,
        scheduledDate: data.scheduledDate,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        notes: data.notes,
      },
      include: { teamLead: true },
    })
  } catch (error) {
    console.error('[Installation] Create error:', error)
    throw error
  }
}

export async function updateInstallation(installationId: string, input: unknown) {
  try {
    const data = CreateInstallationSchema.parse(input)
    return await prisma.oSInstallation.update({
      where: { id: installationId },
      data,
      include: { teamLead: true },
    })
  } catch (error) {
    console.error('[Installation] Update error:', error)
    throw error
  }
}

// Comments
export async function addOSComment(serviceOrderId: string, input: unknown) {
  try {
    const data = CreateCommentSchema.parse(input)
    return await prisma.oSComment.create({
      data: {
        serviceOrderId,
        authorId: 'system', // TODO: get from auth context
        type: data.type,
        content: data.content,
      },
      include: { author: true },
    })
  } catch (error) {
    console.error('[OS Comment] Create error:', error)
    throw error
  }
}

// Quote to OS
export async function generateOSFromQuote(quoteId: string, companyId: string) {
  try {
    return await OSService.generateFromQuote(quoteId, companyId, 'system')
  } catch (error) {
    console.error('[OS] Generate from quote error:', error)
    throw error
  }
}

// Duplicate
export async function duplicateServiceOrder(input: unknown) {
  try {
    const data = DuplicateOSSchema.parse(input)
    return await OSService.duplicateOS(data.osId, data.number, 'system')
  } catch (error) {
    console.error('[OS] Duplicate error:', error)
    throw error
  }
}

// Dashboard
export async function getOSDashboardMetrics(companyId: string) {
  try {
    return await OSService.getDashboardMetrics(companyId)
  } catch (error) {
    console.error('[OS Dashboard] Get metrics error:', error)
    throw error
  }
}

export async function getOSByStatus(companyId: string) {
  try {
    return await OSService.getOSByStatus(companyId)
  } catch (error) {
    console.error('[OS Dashboard] Get by status error:', error)
    throw error
  }
}

export async function getOSByVendedor(companyId: string) {
  try {
    return await OSService.getOSByVendedor(companyId)
  } catch (error) {
    console.error('[OS Dashboard] Get by vendedor error:', error)
    throw error
  }
}
