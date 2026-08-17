import { prisma } from '@/lib/prisma'
import type { CreateSalespersonInput, UpdateSalespersonInput, SalespersonFilters } from '@/src/types/salesperson'

export class SalespersonService {
  static async create(companyId: string, data: CreateSalespersonInput) {
    return prisma.employee.create({
      data: {
        companyId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        commissionRate: data.commissionRate,
        hireDate: data.hireDate,
        notes: data.notes,
        isSalesperson: true,
        status: 'ACTIVE',
        role: 'SALESPERSON',
      },
    })
  }

  static async update(companyId: string, employeeId: string, data: UpdateSalespersonInput) {
    const current = await prisma.employee.findFirst({ where: { id: employeeId, companyId, isSalesperson: true } })
    if (!current) return null
    return prisma.employee.update({
      where: { id: current.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        commissionRate: data.commissionRate,
        status: data.status,
        hireDate: data.hireDate,
        notes: data.notes,
      },
    })
  }

  static async getById(companyId: string, employeeId: string) {
    return prisma.employee.findFirst({
      where: { id: employeeId, companyId, isSalesperson: true },
      include: {
        salesGoals: true,
        serviceOrders: true,
      },
    })
  }

  static async list(companyId: string, filters: SalespersonFilters = {}) {
    const {
      searchTerm = '',
      status = undefined,
      skip = 0,
      take = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    const where = {
      companyId,
      isSalesperson: true,
      ...(status && { status }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { cpf: { contains: searchTerm } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          salesGoals: {
            where: {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.employee.count({ where }),
    ])

    return { data, total }
  }

  static async deactivate(companyId: string, employeeId: string) {
    const current = await prisma.employee.findFirst({ where: { id: employeeId, companyId, isSalesperson: true } })
    if (!current) return null
    return prisma.employee.update({
      where: { id: current.id },
      data: { status: 'INACTIVE' },
    })
  }

  static async activate(companyId: string, employeeId: string) {
    const current = await prisma.employee.findFirst({ where: { id: employeeId, companyId, isSalesperson: true } })
    if (!current) return null
    return prisma.employee.update({
      where: { id: current.id },
      data: { status: 'ACTIVE' },
    })
  }

  static async getMonthlySales(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const serviceOrders = await prisma.serviceOrder.findMany({
      where: {
        vendedorId: employeeId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: { not: 'CANCELLED' },
      },
      include: {
        osCommissions: true,
      },
    })

    const totalValue = serviceOrders.reduce((sum, so) => sum + (Number(so.totalValue) || 0), 0)
    const totalCommission = serviceOrders.reduce((sum, so) => {
      const commission = so.osCommissions.reduce((c, com) => c + (Number(com.commissionValue) || 0), 0)
      return sum + commission
    }, 0)

    return {
      totalValue,
      totalCommission,
      orderCount: serviceOrders.length,
      averageTicket: serviceOrders.length > 0 ? totalValue / serviceOrders.length : 0,
    }
  }

  static async getAnnualStats(employeeId: string, year: number) {
    const stats = {
      months: [] as Array<{
        month: number
        totalValue: number
        totalCommission: number
        orderCount: number
      }>,
    }

    for (let month = 1; month <= 12; month++) {
      const monthStats = await this.getMonthlySales(employeeId, year, month)
      stats.months.push({
        month,
        totalValue: monthStats.totalValue,
        totalCommission: monthStats.totalCommission,
        orderCount: monthStats.orderCount,
      })
    }

    return stats
  }
}
