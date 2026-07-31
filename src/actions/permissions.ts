'use server'

import { prisma } from '@/src/core/database'
import { createAuditLog } from '@/src/lib/audit-service'

/**
 * Get all permissions for a company
 */
export async function getCompanyPermissions(companyId: string) {
  return prisma.permission.findMany({
    where: { companyId },
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  })
}

/**
 * Get all roles with permissions for a company
 */
export async function getRolesWithPermissions(companyId: string) {
  return prisma.role.findMany({
    where: { companyId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Get a single role with all permissions
 */
export async function getRoleWithPermissions(roleId: string) {
  return prisma.role.findUnique({
    where: { id: roleId },
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
 * Update role permissions
 */
export async function updateRolePermissions(
  userId: string,
  roleId: string,
  permissionIds: string[]
) {
  // First remove all current permissions
  await prisma.rolePermission.deleteMany({
    where: { roleId },
  })

  // Then add new permissions
  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      permissions: {
        createMany: {
          data: permissionIds.map(permissionId => ({
            permissionId,
          })),
        },
      },
    },
    include: {
      permissions: true,
    },
  })

  // Audit
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resource: 'roles',
    resourceId: roleId,
    changes: {
      field: 'permissions',
      permissionIds,
    },
  })

  return role
}

/**
 * Create a new role
 */
export async function createRole(
  userId: string,
  companyId: string,
  name: string,
  description?: string,
  permissionIds?: string[]
) {
  const role = await prisma.role.create({
    data: {
      companyId,
      name,
      description,
      permissions: permissionIds
        ? {
            createMany: {
              data: permissionIds.map(permissionId => ({
                permissionId,
              })),
            },
          }
        : undefined,
    },
    include: {
      permissions: true,
    },
  })

  await createAuditLog({
    userId,
    action: 'CREATE',
    resource: 'roles',
    resourceId: role.id,
    changes: { name, description, permissionIds },
  })

  return role
}

/**
 * Update role
 */
export async function updateRole(
  userId: string,
  roleId: string,
  data: {
    name?: string
    description?: string
  }
) {
  const role = await prisma.role.update({
    where: { id: roleId },
    data,
  })

  await createAuditLog({
    userId,
    action: 'UPDATE',
    resource: 'roles',
    resourceId: roleId,
    changes: data,
  })

  return role
}

/**
 * Delete role
 */
export async function deleteRole(userId: string, roleId: string) {
  const role = await prisma.role.delete({
    where: { id: roleId },
  })

  await createAuditLog({
    userId,
    action: 'DELETE',
    resource: 'roles',
    resourceId: roleId,
    changes: { name: role.name },
  })

  return role
}

/**
 * Get user's permissions (cached or fresh)
 */
export async function getUserPermissions(userId: string, companyId: string) {
  const member = await prisma.companyMember.findFirst({
    where: { userId, companyId },
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

  return member.role.permissions.map(rp => ({
    resource: rp.permission.resource,
    action: rp.permission.action,
    name: rp.permission.name,
  }))
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  companyId: string,
  roleId: string,
  adminId: string
) {
  const member = await prisma.companyMember.update({
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
    data: {
      roleId,
    },
  })

  await createAuditLog({
    userId: adminId,
    action: 'UPDATE',
    resource: 'users',
    resourceId: userId,
    changes: { roleId },
  })

  return member
}

/**
 * Check if permission exists, if not create it
 */
export async function ensurePermission(
  companyId: string,
  resource: string,
  action: string,
  name?: string
) {
  const existing = await prisma.permission.findFirst({
    where: {
      companyId,
      resource,
      action,
    },
  })

  if (existing) {
    return existing
  }

  return prisma.permission.create({
    data: {
      companyId,
      resource,
      action,
      name: name || `${resource}.${action}`,
      description: `Permite ${action} em ${resource}`,
    },
  })
}

/**
 * Seed default permissions for a company
 */
export async function seedDefaultPermissions(companyId: string) {
  const defaultPermissions = [
    // Dashboard
    { resource: 'dashboard', action: 'view' },

    // Clientes
    { resource: 'clientes', action: 'create' },
    { resource: 'clientes', action: 'read' },
    { resource: 'clientes', action: 'update' },
    { resource: 'clientes', action: 'delete' },

    // Obras/Projetos
    { resource: 'obras', action: 'view' },
    { resource: 'obras', action: 'create' },
    { resource: 'obras', action: 'edit' },
    { resource: 'obras', action: 'delete' },

    // Financeiro
    { resource: 'financeiro', action: 'view' },
    { resource: 'financeiro', action: 'create' },
    { resource: 'financeiro', action: 'edit' },
    { resource: 'financeiro', action: 'delete' },
    { resource: 'financeiro', action: 'export' },

    // Fornecedores
    { resource: 'fornecedores', action: 'create' },
    { resource: 'fornecedores', action: 'read' },
    { resource: 'fornecedores', action: 'update' },
    { resource: 'fornecedores', action: 'delete' },

    // Relatórios
    { resource: 'relatorios', action: 'view' },
    { resource: 'relatorios', action: 'export' },
    { resource: 'relatorios', action: 'import' },

    // Configurações
    { resource: 'configuracoes', action: 'view' },
    { resource: 'configuracoes', action: 'edit' },
  ]

  const created = await Promise.all(
    defaultPermissions.map(perm =>
      ensurePermission(companyId, perm.resource, perm.action)
    )
  )

  return created
}
