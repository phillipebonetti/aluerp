import { prisma } from '@/lib/prisma'
import type { ServiceOrderStatus, ServiceOrderPriority, OSListFilters } from '@/types/os'
import { Decimal } from 'decimal.js'

export class OSService {
  // Gerar próximo número de OS
  static async generateNextNumber(companyId: string): Promise<string> {
    const settings = await prisma.companySetting.findUnique({
      where: { companyId },
    })

    if (!settings) {
      throw new Error('Configurações da empresa não encontradas')
    }

    const nextNumber = settings.proximoNumeroOS
    const formatted = String(nextNumber).padStart(6, '0')

    // Atualizar próximo número
    await prisma.companySetting.update({
      where: { companyId },
      data: { proximoNumeroOS: nextNumber + 1 },
    })

    return `OS-${new Date().getFullYear()}-${formatted}`
  }

  // Criar OS
  static async createServiceOrder(companyId: string, data: {
    projectId: string
    clientId: string
    vendedorId?: string
    status?: ServiceOrderStatus
    priority?: ServiceOrderPriority
    scheduledDate?: Date
    description?: string
    notes?: string
    totalValue?: number
    downPayment?: number
    installments?: number
    createdBy?: string
  }) {
    const number = await this.generateNextNumber(companyId)

    const balance = new Decimal((data.totalValue || 0) - (data.downPayment || 0))

    return prisma.serviceOrder.create({
      data: {
        companyId,
        number,
        projectId: data.projectId,
        clientId: data.clientId,
        vendedorId: data.vendedorId,
        status: data.status || 'DRAFT',
        priority: data.priority || 'NORMAL',
        scheduledDate: data.scheduledDate,
        description: data.description,
        notes: data.notes,
        totalValue: new Decimal(data.totalValue || 0),
        downPayment: new Decimal(data.downPayment || 0),
        balance,
        installments: data.installments || 1,
        createdBy: data.createdBy,
      },
      include: {
        client: true,
        project: true,
        quote: true,
        vendedor: true,
      },
    })
  }

  // Listar OSs com filtros
  static async listServiceOrders(companyId: string, filters?: OSListFilters) {
    const where: any = { companyId, deletedAt: null }

    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.vendedorId) where.vendedorId = filters.vendedorId
    if (filters?.status) where.status = filters.status
    if (filters?.priority) where.priority = filters.priority

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    if (filters?.searchTerm) {
      where.OR = [
        { number: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        { client: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ]
    }

    const skip = filters?.skip || 0
    const take = filters?.take || 10
    const sortBy = filters?.sortBy || 'createdAt'
    const sortOrder = filters?.sortOrder || 'desc'

    const [data, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        include: {
          client: true,
          project: true,
          vendedor: true,
          _count: { select: { products: true, productionStages: true, installations: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      prisma.serviceOrder.count({ where }),
    ])

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    }
  }

  // Obter OS por ID com todas as relações
  static async getServiceOrderById(id: string) {
    return prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        quote: true,
        vendedor: true,
        products: { orderBy: { sequence: 'asc' } },
        productionStages: { orderBy: { sequence: 'asc' }, include: { responsible: true } },
        installations: { orderBy: { sequence: 'asc' }, include: { teamLead: true } },
        comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
        attachments: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  // Atualizar status da OS
  static async updateStatus(id: string, status: ServiceOrderStatus, updatedBy?: string) {
    return prisma.serviceOrder.update({
      where: { id },
      data: {
        status,
        updatedBy,
        updatedAt: new Date(),
      },
    })
  }

  // Gerar OS a partir de Orçamento
  static async generateFromQuote(quoteId: string, companyId: string, createdBy?: string) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        project: true,
        salesperson: true,
        items: true,
      },
    })

    if (!quote) throw new Error('Orçamento não encontrado')

    const os = await this.createServiceOrder(companyId, {
      projectId: quote.projectId || '',
      clientId: quote.clientId,
      vendedorId: quote.salespersonId || undefined,
      status: 'SCHEDULED',
      priority: 'NORMAL',
      description: quote.notes || undefined,
      totalValue: quote.totalValue.toNumber(),
      createdBy,
      quoteId,
    })

    // Copiar itens do orçamento para produtos da OS
    for (const item of quote.items) {
      await prisma.oSProduct.create({
        data: {
          serviceOrderId: os.id,
          sequence: item.sequence || 0,
          description: item.description || '',
          quantity: item.quantity,
          width: item.width?.toNumber(),
          height: item.height?.toNumber(),
          area: item.area?.toNumber(),
          unitValue: item.unitPrice,
          totalValue: item.totalPrice,
        },
      })
    }

    return os
  }

  // Adicionar comentário
  static async addComment(serviceOrderId: string, authorId: string, content: string) {
    return prisma.oSComment.create({
      data: {
        serviceOrderId,
        authorId,
        type: 'COMMENT',
        content,
      },
      include: { author: true },
    })
  }

  // Obter dashboard metrics
  static async getDashboardMetrics(companyId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalOS, osEmProducao, osEmInstalacao, osConcluidas, osAtrasadas, financeiro] = await Promise.all([
      prisma.serviceOrder.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.serviceOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.serviceOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: 'SCHEDULED',
        },
      }),
      prisma.serviceOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: 'COMPLETED',
        },
      }),
      prisma.serviceOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: ['IN_PROGRESS', 'SCHEDULED'] },
          scheduledDate: { lt: today },
        },
      }),
      prisma.serviceOrder.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { totalValue: true },
      }),
    ])

    return {
      totalOS,
      osEmProducao,
      osEmInstalacao,
      osConcluidas,
      osAtrasadas,
      valorTotal: financeiro._sum.totalValue?.toNumber() || 0,
    }
  }

  // Obter OSs por status (para gráficos)
  static async getOSByStatus(companyId: string) {
    const result = await prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { companyId, deletedAt: null },
      _count: true,
    })

    return result.map((item) => ({
      status: item.status,
      count: item._count,
    }))
  }

  // Obter OSs por vendedor (para gráficos)
  static async getOSByVendedor(companyId: string) {
    const result = await prisma.serviceOrder.groupBy({
      by: ['vendedorId'],
      where: { companyId, deletedAt: null, vendedorId: { not: null } },
      _count: true,
      _sum: { totalValue: true },
    })

    const withVendedorNames = await Promise.all(
      result.map(async (item) => {
        if (!item.vendedorId) return null
        const vendedor = await prisma.employee.findUnique({ where: { id: item.vendedorId } })
        return {
          vendedorId: item.vendedorId,
          vendedorName: vendedor?.name || 'Desconhecido',
          count: item._count,
          totalValue: item._sum.totalValue?.toNumber() || 0,
        }
      })
    )

    return withVendedorNames.filter(Boolean)
  }

  // Duplicar OS
  static async duplicateOS(osId: string, newNumber?: string, createdBy?: string) {
    const original = await this.getServiceOrderById(osId)
    if (!original) throw new Error('OS não encontrada')

    const number = newNumber || await this.generateNextNumber(original.companyId)

    const newOS = await prisma.serviceOrder.create({
      data: {
        companyId: original.companyId,
        projectId: original.projectId,
        clientId: original.clientId,
        vendedorId: original.vendedorId,
        number,
        status: 'DRAFT',
        priority: original.priority,
        description: original.description,
        notes: original.notes,
        totalValue: original.totalValue,
        downPayment: original.downPayment,
        balance: original.balance,
        installments: original.installments,
        createdBy,
      },
    })

    // Copiar produtos
    if (original.products && original.products.length > 0) {
      await prisma.oSProduct.createMany({
        data: original.products.map((p) => ({
          serviceOrderId: newOS.id,
          sequence: p.sequence,
          description: p.description,
          quantity: p.quantity,
          width: p.width,
          height: p.height,
          area: p.area,
          unitValue: p.unitValue,
          totalValue: p.totalValue,
          notes: p.notes,
        })),
      })
    }

    return newOS
  }

  // Soft delete
  static async deleteServiceOrder(id: string) {
    return prisma.serviceOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
