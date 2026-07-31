import { prisma } from '@/src/core/database'
import { RepositoryOptions } from '@/repositories'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  companyId: string
  role: string
  permissions: string[]
}

export class AuthService {
  /**
   * Recupera usuário por ID com permissões
   */
  async getUserWithPermissions(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              select: { permission: true },
            },
          },
        },
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      avatar: user.image,
      companyId: user.companyId || '',
      role: user.role?.name || 'user',
      permissions: user.role?.permissions.map(p => p.permission.code) || [],
    }
  }

  /**
   * Recupera usuário por email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              select: { permission: true },
            },
          },
        },
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      avatar: user.image,
      companyId: user.companyId || '',
      role: user.role?.name || 'user',
      permissions: user.role?.permissions.map(p => p.permission.code) || [],
    }
  }

  /**
   * Verifica se usuário tem permissão
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId)
    return user?.permissions.includes(permissionCode) || false
  }

  /**
   * Verifica se usuário tem alguma das permissões
   */
  async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId)
    return user?.permissions.some(p => permissionCodes.includes(p)) || false
  }

  /**
   * Verifica se usuário tem todas as permissões
   */
  async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId)
    return permissionCodes.every(p => user?.permissions.includes(p))
  }

  /**
   * Recupera usuários da empresa
   */
  async getCompanyUsers(companyId: string): Promise<AuthUser[]> {
    const users = await prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              select: { permission: true },
            },
          },
        },
      },
    })

    return users.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.name,
      avatar: user.image,
      companyId: user.companyId || '',
      role: user.role?.name || 'user',
      permissions: user.role?.permissions.map(p => p.permission.code) || [],
    }))
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string
      avatar?: string
    },
  ): Promise<AuthUser | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.avatar,
      },
      include: {
        role: {
          include: {
            permissions: {
              select: { permission: true },
            },
          },
        },
      },
    })

    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      avatar: user.image,
      companyId: user.companyId || '',
      role: user.role?.name || 'user',
      permissions: user.role?.permissions.map(p => p.permission.code) || [],
    }
  }

  /**
   * Verifica acesso à empresa
   */
  async canAccessCompany(userId: string, companyId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        deletedAt: null,
      },
    })

    return !!user
  }

  /**
   * Recupera permissões do usuário
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.getUserWithPermissions(userId)
    return user?.permissions || []
  }

  /**
   * Recupera role do usuário
   */
  async getUserRole(userId: string): Promise<string> {
    const user = await this.getUserWithPermissions(userId)
    return user?.role || 'user'
  }

  /**
   * Verifica se é admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId)
    return user?.role === 'admin'
  }

  /**
   * Recupera permissões por role
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          select: { permission: true },
        },
      },
    })

    return role?.permissions.map(p => p.permission.code) || []
  }
}
