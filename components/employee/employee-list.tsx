'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmployeeForm } from './employee-form'
import * as EmployeeActions from '@/modules/Employee/actions'
import type { Employee } from '@/modules/Employee/types'

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    setLoading(true)
    const result = await EmployeeActions.getEmployees()
    if (result.data) {
      setEmployees(result.data)
    }
    setLoading(false)
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-red-100 text-red-800',
  }

  const roleLabels: Record<string, string> = {
    SELLER: 'Vendedor',
    TECHNICIAN: 'Técnico',
    MANAGER: 'Gerente',
    ADMIN: 'Admin',
    OTHER: 'Outro',
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (showForm || editingEmployee) {
    return (
      <EmployeeForm
        employee={editingEmployee}
        onSubmit={async () => {
          setEditingEmployee(null)
          setShowForm(false)
          await loadEmployees()
        }}
        onCancel={() => {
          setEditingEmployee(null)
          setShowForm(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(true)}>+ Novo Funcionário</Button>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">E-mail</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Telefone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Função</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Comissão</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{employee.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.phone || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="outline">{roleLabels[employee.role]}</Badge>
                </td>
                <td className="px-6 py-4 text-sm">{employee.commissionRate}%</td>
                <td className="px-6 py-4 text-sm">
                  <Badge className={statusColors[employee.status]}>
                    {employee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEmployee(employee)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum funcionário cadastrado ainda
        </div>
      )}
    </div>
  )
}
