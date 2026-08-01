'use server'

import { SalespersonService } from '@/src/lib/services/salesperson-service'
import { CreateSalespersonSchema, UpdateSalespersonSchema, SalespersonFiltersSchema } from '@/src/lib/schemas/salesperson'
import type { CreateSalespersonInput, UpdateSalespersonInput, SalespersonFilters } from '@/src/types/salesperson'

export async function createSalesperson(companyId: string, input: CreateSalespersonInput) {
  try {
    const validated = CreateSalespersonSchema.parse(input)
    const salesperson = await SalespersonService.create(companyId, validated)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error creating salesperson:', error)
    return { success: false, error: 'Falha ao criar vendedor' }
  }
}

export async function updateSalesperson(employeeId: string, input: UpdateSalespersonInput) {
  try {
    const validated = UpdateSalespersonSchema.parse(input)
    const salesperson = await SalespersonService.update(employeeId, validated)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error updating salesperson:', error)
    return { success: false, error: 'Falha ao atualizar vendedor' }
  }
}

export async function getSalesperson(employeeId: string) {
  try {
    const salesperson = await SalespersonService.getById(employeeId)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error fetching salesperson:', error)
    return { success: false, error: 'Falha ao buscar vendedor' }
  }
}

export async function listSalespeople(companyId: string, filters?: SalespersonFilters) {
  try {
    const validated = SalespersonFiltersSchema.parse(filters || {})
    const result = await SalespersonService.list(companyId, validated)
    return { success: true, ...result }
  } catch (error) {
    console.error('Error listing salespeople:', error)
    return { success: false, data: [], total: 0, error: 'Falha ao listar vendedores' }
  }
}

export async function deactivateSalesperson(employeeId: string) {
  try {
    const salesperson = await SalespersonService.deactivate(employeeId)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error deactivating salesperson:', error)
    return { success: false, error: 'Falha ao desativar vendedor' }
  }
}

export async function activateSalesperson(employeeId: string) {
  try {
    const salesperson = await SalespersonService.activate(employeeId)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error activating salesperson:', error)
    return { success: false, error: 'Falha ao ativar vendedor' }
  }
}

export async function getSalespersonStats(employeeId: string) {
  try {
    const now = new Date()
    const monthlySales = await SalespersonService.getMonthlySales(employeeId, now.getFullYear(), now.getMonth() + 1)
    const annualStats = await SalespersonService.getAnnualStats(employeeId, now.getFullYear())
    
    return { success: true, data: { monthlySales, annualStats } }
  } catch (error) {
    console.error('Error fetching salesperson stats:', error)
    return { success: false, error: 'Falha ao buscar estatísticas do vendedor' }
  }
}
