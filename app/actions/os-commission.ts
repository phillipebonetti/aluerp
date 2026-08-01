'use server'

import { prisma } from '@/lib/prisma'
import { CommissionService } from '@/src/lib/services/os-commission-service'
import { CreateOSCommissionSchema, ApproveCommissionSchema, PayCommissionSchema } from '@/src/lib/schemas/os-1b'
import type { CreateOSCommission, ApproveCommission, PayCommission } from '@/src/lib/schemas/os-1b'

export async function createCommission(data: CreateOSCommission) {
  try {
    const validated = CreateOSCommissionSchema.parse(data)
    return await CommissionService.createCommission(validated)
  } catch (error) {
    console.error('[OS Commission] Create error:', error)
    throw new Error('Erro ao criar comissão')
  }
}

export async function approveCommission(data: ApproveCommission) {
  try {
    const validated = ApproveCommissionSchema.parse(data)
    return await CommissionService.approveCommission(validated.id, validated.approvedBy)
  } catch (error) {
    console.error('[OS Commission] Approve error:', error)
    throw new Error('Erro ao aprovar comissão')
  }
}

export async function payCommission(data: PayCommission) {
  try {
    const validated = PayCommissionSchema.parse(data)
    return await CommissionService.payCommission(validated.id, validated.paidAt)
  } catch (error) {
    console.error('[OS Commission] Pay error:', error)
    throw new Error('Erro ao marcar comissão como paga')
  }
}

export async function cancelCommission(id: string, notes?: string) {
  try {
    return await CommissionService.cancelCommission(id, notes)
  } catch (error) {
    console.error('[OS Commission] Cancel error:', error)
    throw new Error('Erro ao cancelar comissão')
  }
}

export async function listCommissions(serviceOrderId: string) {
  try {
    return await CommissionService.listCommissions(serviceOrderId)
  } catch (error) {
    console.error('[OS Commission] List error:', error)
    throw new Error('Erro ao listar comissões')
  }
}

export async function getCommission(id: string) {
  try {
    return await CommissionService.getCommission(id)
  } catch (error) {
    console.error('[OS Commission] Get error:', error)
    throw new Error('Erro ao obter comissão')
  }
}

export async function getCommissionsStats(serviceOrderId: string) {
  try {
    return await CommissionService.getCommissionsStats(serviceOrderId)
  } catch (error) {
    console.error('[OS Commission] Stats error:', error)
    throw new Error('Erro ao obter estatísticas')
  }
}

export async function getTotalCommission(serviceOrderId: string) {
  try {
    return await CommissionService.getTotalCommission(serviceOrderId)
  } catch (error) {
    console.error('[OS Commission] Total error:', error)
    throw new Error('Erro ao calcular total')
  }
}

export async function recalculateCommission(id: string, newOsValue?: number, newRate?: number) {
  try {
    return await CommissionService.recalculateCommission(id, newOsValue, newRate)
  } catch (error) {
    console.error('[OS Commission] Recalculate error:', error)
    throw new Error('Erro ao recalcular comissão')
  }
}

export async function getCommissionReport(
  companyId: string,
  startDate: Date,
  endDate: Date,
  vendedorId?: string
) {
  try {
    return await CommissionService.getCommissionReport(companyId, startDate, endDate, vendedorId)
  } catch (error) {
    console.error('[OS Commission] Report error:', error)
    throw new Error('Erro ao gerar relatório')
  }
}

export async function bulkApproveCommissions(serviceOrderIds: string[], approvedBy: string) {
  try {
    return await CommissionService.bulkApproveCommissions(serviceOrderIds, approvedBy)
  } catch (error) {
    console.error('[OS Commission] Bulk approve error:', error)
    throw new Error('Erro ao aprovar comissões em lote')
  }
}

export async function bulkPayCommissions(commissionIds: string[]) {
  try {
    return await CommissionService.bulkPayCommissions(commissionIds)
  } catch (error) {
    console.error('[OS Commission] Bulk pay error:', error)
    throw new Error('Erro ao pagar comissões em lote')
  }
}
