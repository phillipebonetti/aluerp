'use server'

import { prisma } from '@/lib/prisma'
import { OSService } from '@/src/lib/services/os-service'
import type { CreateOSInput } from '@/src/types/os'

/**
 * Generate a new Service Order from an approved Quote
 * Copies products, client info, and other relevant data
 */
export async function generateOSFromQuote(companyId: string, quoteId: string, input?: Partial<CreateOSInput>) {
  try {
    // Fetch the quote with all relationships
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        items: true,
        project: true,
        salesperson: true,
      },
    })

    if (!quote) {
      throw new Error('Quote not found')
    }

    if (quote.companyId !== companyId) {
      throw new Error('Unauthorized - Quote belongs to different company')
    }

    if (quote.status !== 'APPROVED' && quote.status !== 'SENT' && quote.status !== 'ACCEPTED') {
      throw new Error('Quote must be approved, sent, or accepted to generate a Service Order')
    }

    // Create the Service Order
    const osData: CreateOSInput = {
      projectId: quote.projectId || '',
      clientId: quote.clientId,
      quoteId: quote.id,
      vendedorId: quote.salespersonId,
      description: quote.description || `Generated from Quote #${quote.number}`,
      totalValue: quote.totalValue,
      downPayment: input?.downPayment || 0,
      installments: input?.installments || 1,
      priority: input?.priority || 'NORMAL',
      ...input,
    }

    // Create main Service Order
    const serviceOrder = await OSService.createServiceOrder(companyId, {
      ...osData,
      createdBy: 'system',
    })

    // Copy products from quote to Service Order
    if (quote.items && quote.items.length > 0) {
      let sequence = 1
      for (const item of quote.items) {
        await prisma.oSProduct.create({
          data: {
            serviceOrderId: serviceOrder.id,
            sequence,
            description: item.description || '',
            quantity: item.quantity,
            unitValue: item.unitPrice,
            totalValue: item.totalValue,
            notes: item.notes,
          },
        })
        sequence++
      }
    }

    // Create initial production stage (placeholder)
    await prisma.oSProductionStage.create({
      data: {
        serviceOrderId: serviceOrder.id,
        sequence: 1,
        name: 'Preparação',
        status: 'PENDING',
      },
    })

    // Add comment noting origin
    await prisma.oSComment.create({
      data: {
        serviceOrderId: serviceOrder.id,
        authorId: 'system',
        type: 'ATTACHMENT_ADDED',
        content: `Service Order generated from Quote #${quote.number}`,
      },
    })

    // Update quote to reference this OS
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'CONVERTED', // If your Quote enum supports this
      },
    })

    return {
      success: true,
      serviceOrderId: serviceOrder.id,
      serviceOrder,
      productsCount: quote.items?.length || 0,
    }
  } catch (error) {
    console.error('[Quote to OS] Error:', error)
    throw error
  }
}

/**
 * Get quotes ready to be converted to Service Orders
 */
export async function getConvertibleQuotes(companyId: string) {
  try {
    const quotes = await prisma.quote.findMany({
      where: {
        companyId,
        status: { in: ['APPROVED', 'ACCEPTED'] },
        serviceOrders: {
          none: {}, // Only quotes without associated OS
        },
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return quotes
  } catch (error) {
    console.error('[Get Convertible Quotes] Error:', error)
    throw error
  }
}

/**
 * Batch convert multiple quotes to Service Orders
 */
export async function batchConvertQuotesToOS(
  companyId: string,
  quoteIds: string[],
  commonData?: Partial<CreateOSInput>,
) {
  const results = {
    successful: [] as string[],
    failed: [] as { quoteId: string; error: string }[],
  }

  for (const quoteId of quoteIds) {
    try {
      const result = await generateOSFromQuote(companyId, quoteId, commonData)
      results.successful.push(result.serviceOrderId)
    } catch (error) {
      results.failed.push({
        quoteId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
