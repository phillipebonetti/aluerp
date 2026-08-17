'use server'

import { SalespersonService } from '@/src/lib/services/salesperson-service'
import { getSession } from '@/src/core/auth'
import { CreateSalespersonSchema, UpdateSalespersonSchema, SalespersonFiltersSchema } from '@/src/lib/schemas/salesperson'
import type { CreateSalespersonInput, UpdateSalespersonInput, SalespersonFilters } from '@/src/types/salesperson'

export async function createSalesperson(_companyId: string, input: CreateSalespersonInput) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autorizado' }
    const validated = CreateSalespersonSchema.parse(input)
    const salesperson = await SalespersonService.create(session.company.id, validated)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error creating salesperson:', error)
    return { success: false, error: 'Falha ao criar vendedor' }
  }
}

export async function updateSalesperson(employeeId: string, input: UpdateSalespersonInput) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autorizado' }
    const validated = UpdateSalespersonSchema.parse(input)
    const salesperson = await SalespersonService.update(session.company.id, employeeId, validated)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error updating salesperson:', error)
    return { success: false, error: 'Falha ao atualizar vendedor' }
  }
}

export async function getSalesperson(employeeId: string) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autorizado' }
    const salesperson = await SalespersonService.getById(session.company.id, employeeId)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error fetching salesperson:', error)
    return { success: false, error: 'Falha ao buscar vendedor' }
  }
}

export async function listSalespeople(_companyId: string, filters?: SalespersonFilters) {
  try {
    const session = await getSession()
    if (!session) return { success: false, data: [], total: 0, error: 'Não autorizado' }
    const validated = SalespersonFiltersSchema.parse(filters || {})
    const result = await SalespersonService.list(session.company.id, validated)
    return { success: true, ...result }
  } catch (error) {
    console.error('Error listing salespeople:', error)
    return { success: false, data: [], total: 0, error: 'Falha ao listar vendedores' }
  }
}

export async function deactivateSalesperson(employeeId: string) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autorizado' }
    const salesperson = await SalespersonService.deactivate(session.company.id, employeeId)
    return { success: true, data: salesperson }
  } catch (error) {
    console.error('Error deactivating salesperson:', error)
    return { success: false, error: 'Falha ao desativar vendedor' }
  }
}

export async function activateSalesperson(employeeId: string) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autorizado' }
    const salesperson = await SalespersonService.activate(session.company.id, employeeId)
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
