import { prisma } from '@/lib/prisma'
import type { RepositoryOptions } from '@/src/repositories'

export class RolePermissionService {
  /**
   * Cria um novo role personalizado
   */
  async createRole(options: RepositoryOptions, data: {
    name: string
    description?: string
    isDefault?: boolean
  }): Promise<any> {
    return prisma.role.create({
      data: {
        companyId: options.companyId,
        name: data.name,
        description: data.description,
        isDefault: data.isDefault || false,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }

  /**
   * Atualiza um role existente
   */
  async updateRole(roleId: string, data: {
    name?: string
    description?: string
    isDefault?: boolean
  }): Promise<any> {
    return prisma.role.update({
      where: { id: roleId },
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }

  /**
   * Deleta um role
   */
  async deleteRole(roleId: string): Promise<void> {
    await prisma.role.delete({
      where: { id: roleId },
    })
  }

  /**
   * Recupera todos os roles de uma empresa
   */
  async getRoles(companyId: string): Promise<any[]> {
    return prisma.role.findMany({
      where: { companyId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Recupera um role específico
   */
  async getRole(roleId: string): Promise<any> {
    return prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        members: true,
      },
    })
  }

  /**
   * Atribui permissões a um role
   */
  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    // Remove permissões existentes
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    })

    // Adiciona novas permissões
    await prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId,
        permissionId,
      })),
    })
  }

  /**
   * Cria uma permissão personalizada
   */
  async createPermission(options: RepositoryOptions, data: {
    name: string
    description?: string
    resource: string
    action: string
  }): Promise<any> {
    return prisma.permission.create({
      data: {
        companyId: options.companyId,
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
      },
    })
  }

  /**
   * Recupera todas as permissões de uma empresa
   */
  async getPermissions(companyId: string): Promise<any[]> {
    return prisma.permission.findMany({
      where: { companyId },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })
  }

  /**
   * Recupera permissões de um usuário através de seu role
   */
  async getUserPermissions(userId: string, companyId: string): Promise<any[]> {
    const member = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    if (!member?.role) {
      return []
    }

    return member.role.permissions.map(rp => rp.permission)
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async userHasPermission(
    userId: string,
    companyId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const member = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!member?.role) {
      return false
    }

    return member.role.permissions.some(
      rp => rp.permission.resource === resource && rp.permission.action === action
    )
  }

  /**
   * Atribui um role a um usuário
   */
  async assignRoleToUser(
    userId: string,
    companyId: string,
    roleId: string
  ): Promise<void> {
    await prisma.companyMember.update({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      data: { roleId },
    })
  }

  /**
   * Remove um role de um usuário
   */
  async removeRoleFromUser(userId: string, companyId: string): Promise<void> {
    await prisma.companyMember.update({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      data: { roleId: null },
    })
  }
}
