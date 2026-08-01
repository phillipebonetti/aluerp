'use server'

import { CommissionCalculationService } from '@/src/lib/services/commission-calculation-service'
import { ApproveCommissionSchema, PayCommissionSchema, ReverseCommissionSchema } from '@/src/lib/schemas/salesperson'
import type { ApproveCommission, PayCommission, ReverseCommission } from '@/src/types/salesperson'

export async function calculateCommission(employeeId: string, osValue: number) {
  try {
    const commission = await CommissionCalculationService.calculateCommission(employeeId, osValue)
    return { success: true, data: commission }
  } catch (error) {
    console.error('Error calculating commission:', error)
    return { success: false, error: 'Falha ao calcular comissão' }
  }
}

export async function createCommissionFromServiceOrder(serviceOrderId: string) {
  try {
    const commission = await CommissionCalculationService.createCommissionFromServiceOrder(serviceOrderId)
    return { success: true, data: commission }
  } catch (error) {
    console.error('Error creating commission:', error)
    return { success: false, error: 'Falha ao criar comissão' }
  }
}

export async function releaseCommission(osCommissionId: string, approvedBy?: string) {
  try {
    const commission = await CommissionCalculationService.releaseCommission(osCommissionId, approvedBy)
    return { success: true, data: commission }
  } catch (error) {
    console.error('Error releasing commission:', error)
    return { success: false, error: 'Falha ao liberar comissão' }
  }
}

export async function aggregateMonthlyCommissions(employeeId: string, year: number, month: number) {
  try {
    const result = await CommissionCalculationService.aggregateMonthlyCommissions(employeeId, year, month)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error aggregating commissions:', error)
    return { success: false, error: 'Falha ao agrupar comissões' }
  }
}

export async function createMonthlyPayment(companyId: string, employeeId: string, year: number, month: number) {
  try {
    const payment = await CommissionCalculationService.createMonthlyPayment(companyId, employeeId, year, month)
    return { success: true, data: payment }
  } catch (error) {
    console.error('Error creating monthly payment:', error)
    return { success: false, error: 'Falha ao criar pagamento mensal' }
  }
}
