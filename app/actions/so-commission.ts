'use server'

import { SOCommissionIntegrationService } from '@/lib/services/so-commission-integration'

export async function generateCommissionFromServiceOrder(serviceOrderId: string) {
  try {
    const validation = await SOCommissionIntegrationService.validateServiceOrderForCommission(serviceOrderId)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    return await SOCommissionIntegrationService.generateCommissionFromServiceOrder(serviceOrderId)
  } catch (error) {
    console.error('[v0] Error generating commission:', error)
    throw error
  }
}

export async function calculateCommissionForServiceOrder(serviceOrderId: string) {
  try {
    return await SOCommissionIntegrationService.calculateCommissionForServiceOrder(serviceOrderId)
  } catch (error) {
    console.error('[v0] Error calculating commission:', error)
    throw error
  }
}

export async function getServiceOrderCommissionSummary(serviceOrderId: string) {
  try {
    return await SOCommissionIntegrationService.getServiceOrderCommissionSummary(serviceOrderId)
  } catch (error) {
    console.error('[v0] Error getting commission summary:', error)
    throw error
  }
}

export async function validateServiceOrderForCommission(serviceOrderId: string) {
  try {
    return await SOCommissionIntegrationService.validateServiceOrderForCommission(serviceOrderId)
  } catch (error) {
    console.error('[v0] Error validating service order:', error)
    throw error
  }
}
