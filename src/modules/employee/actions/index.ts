'use server'

import { getPrisma } from '@/src/core/database'
import { getSession } from '@/src/core/auth'

export interface ActionResult<T = null> {
  data?: T
  error?: string
}

type CreateEmployeeInput = any
type UpdateEmployeeInput = any

// Get employees for current company
export async function getEmployees(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    const employees = await prisma.employee.findMany({
      where: {
        companyId: session.company.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { data: employees }
  } catch (error) {
    return { error: 'Erro ao buscar funcionários' }
  }
}

// Create employee
export async function createEmployee(input: CreateEmployeeInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    // TODO: Add validation schema
    const validated = input

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check for duplicate email in company
    if (validated.email) {
      const existing = await prisma.employee.findFirst({
        where: {
          companyId: session.company.id,
          email: validated.email,
          deletedAt: null,
        },
      })
      if (existing) {
        return { error: 'E-mail já cadastrado nesta empresa' }
      }
    }

    const employee = await prisma.employee.create({
      data: {
        companyId: session.company.id,
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        role: validated.role,
        commissionRate: validated.commissionRate,
        status: validated.status,
      },
    })

    return { data: employee }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao criar funcionário' }
  }
}

// Update employee
export async function updateEmployee(input: UpdateEmployeeInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    // Validate input
    const validated = input

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const existing = await prisma.employee.findFirst({
      where: {
        id: validated.id,
        companyId: session.company.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return { error: 'Funcionário não encontrado' }
    }

    // Check for duplicate email if updating email
    if (validated.email && validated.email !== existing.email) {
      const duplicate = await prisma.employee.findFirst({
        where: {
          companyId: session.company.id,
          email: validated.email,
          id: { not: validated.id },
          deletedAt: null,
        },
      })
      if (duplicate) {
        return { error: 'E-mail já cadastrado nesta empresa' }
      }
    }

    const employee = await prisma.employee.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        role: validated.role,
        commissionRate: validated.commissionRate,
        status: validated.status,
      },
    })

    return { data: employee }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao atualizar funcionário' }
  }
}

// Soft delete employee
export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: session.company.id,
      },
    })

    if (!employee) {
      return { error: 'Funcionário não encontrado' }
    }

    // Check if has commission history (quotes or transactions)
    const hasHistory = await prisma.quote.findFirst({
      where: {
        salespersonId: id,
        status: 'APPROVED',
      },
    })

    if (hasHistory) {
      return { error: 'Não é possível deletar funcionário com histórico de comissão' }
    }

    // Soft delete
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return { data: null }
  } catch (error) {
    return { error: 'Erro ao deletar funcionário' }
  }
}
