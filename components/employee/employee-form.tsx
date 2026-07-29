'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as EmployeeActions from '@/modules/Employee/actions'
import type { Employee } from '@/modules/Employee/types'

interface EmployeeFormProps {
  employee?: Employee | null
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || 'SELLER',
    commissionRate: employee?.commissionRate || 0,
    status: employee?.status || 'ACTIVE',
  })

  const roles = [
    { value: 'SELLER', label: 'Vendedor' },
    { value: 'TECHNICIAN', label: 'Técnico' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'OTHER', label: 'Outro' },
  ]

  const statuses = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
    { value: 'ARCHIVED', label: 'Arquivado' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (employee) {
        result = await EmployeeActions.updateEmployee({
          id: employee.id,
          ...formData,
          commissionRate: Number(formData.commissionRate),
        })
      } else {
        result = await EmployeeActions.createEmployee({
          ...formData,
          commissionRate: Number(formData.commissionRate),
        })
      }

      if (result.error) {
        setError(result.error)
      } else {
        await onSubmit()
      }
    } catch (err: any) {
      setError('Erro ao salvar funcionário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto border rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">
        {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="João Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="joao@empresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Função</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comissão (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value as any })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full border rounded px-3 py-2"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
