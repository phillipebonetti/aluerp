'use server'

import { QuoteReceivableIntegrationService } from '@/lib/services/quote-receivable-integration'

export async function validateQuoteForReceivable(quoteId: string) {
  try {
    return await QuoteReceivableIntegrationService.validateQuoteForReceivable(quoteId)
  } catch (error) {
    console.error('[v0] Error validating quote:', error)
    throw error
  }
}

export async function generateReceivableFromQuote(
  quoteId: string,
  numberOfInstallments: number = 1,
  firstDueDate?: Date
) {
  try {
    const validation = await QuoteReceivableIntegrationService.validateQuoteForReceivable(quoteId)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    return await QuoteReceivableIntegrationService.generateReceivableFromQuote(
      quoteId,
      numberOfInstallments,
      firstDueDate
    )
  } catch (error) {
    console.error('[v0] Error generating receivable:', error)
    throw error
  }
}

export async function getQuoteTotalValue(quoteId: string) {
  try {
    return await QuoteReceivableIntegrationService.getQuoteTotalValue(quoteId)
  } catch (error) {
    console.error('[v0] Error getting quote total:', error)
    throw error
  }
}
