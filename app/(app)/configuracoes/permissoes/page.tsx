'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getRolesWithPermissions,
  getCompanyPermissions,
  updateRolePermissions,
  createRole,
  deleteRole,
} from '@/src/actions/permissions'
import { Permission } from '@/components/auth/Permission'


export default function PermissionsPage() {
  const [companyId] = useState('') // Get from session
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', companyId],
    queryFn: () => getRolesWithPermissions(companyId),
  })

  // Fetch permissions
  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions', companyId],
    queryFn: () => getCompanyPermissions(companyId),
  })

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: (data: { roleId: string; permissionIds: string[] }) =>
      updateRolePermissions('', data.roleId, data.permissionIds),
    onSuccess: () => {
      // Invalidate and refetch
    },
  })

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (name: string) =>
      createRole('', companyId, name),
    onSuccess: () => {
      setNewRoleName('')
      setShowCreateForm(false)
    },
  })

  const isLoading = rolesLoading || permissionsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Permissões</h1>
          <p className="text-gray-600 mt-2">
            Configure papéis e permissões para controlar acesso ao sistema
          </p>
        </div>
        <Permission action="configuracoes.edit">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Novo Papel'}
          </Button>
        </Permission>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Papel
              </label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Ex: Gerente de Vendas"
              />
            </div>
          </div>
          <Button
            onClick={() => createRoleMutation.mutate(newRoleName)}
            disabled={createRoleMutation.isPending || !newRoleName}
          >
            Criar Papel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Papéis</h2>
          <div className="space-y-2">
            {roles?.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedRole === role.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{role.name}</div>
                <div className="text-xs text-gray-500">
                  {role.permissions.length} permissões
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="col-span-2">
          {selectedRole ? (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">
                Permissões para{' '}
                {roles?.find((r) => r.id === selectedRole)?.name}
              </h2>

              <div className="bg-white border rounded-lg p-4 space-y-3">
                {allPermissions?.map((permission) => {
                  const rolePermissions = roles
                    ?.find((r) => r.id === selectedRole)
                    ?.permissions.map((rp) => rp.permission.id) || []

                  const isChecked = rolePermissions.includes(permission.id)

                  return (
                    <label
                      key={permission.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          const newIds = isChecked
                            ? rolePermissions.filter((id) => id !== permission.id)
                            : [...rolePermissions, permission.id]

                          updatePermissionsMutation.mutate({
                            roleId: selectedRole,
                            permissionIds: newIds,
                          })
                        }}
                      />
                      <div>
                        <div className="font-medium">
                          {permission.resource}.{permission.action}
                        </div>
                        <div className="text-sm text-gray-600">
                          {permission.description}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Selecione um papel para gerenciar suas permissões
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
