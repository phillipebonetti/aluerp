'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAuditLogs } from '@/src/lib/audit-service'

export const metadata = {
  title: 'Auditoria',
  description: 'Visualizar logs de auditoria do sistema',
}

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT']
const RESOURCES = [
  'clientes',
  'projetos',
  'financeiro',
  'fornecedores',
  'relatorios',
  'usuarios',
  'AUTH',
]

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    resource: '',
    action: '',
    search: '',
    page: 1,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () =>
      getAuditLogs({
        resource: filters.resource || undefined,
        action: filters.action || undefined,
        limit: 50,
        offset: (filters.page - 1) * 50,
      }),
  })

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    // TODO: Implement export functionality
    console.log('Export as', format)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Auditoria</h1>
        <p className="text-gray-600 mt-2">
          Histórico completo de alterações e ações no sistema
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <Input
            placeholder="Buscar por ID ou email..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />

          {/* Resource Filter */}
          <Select
            value={filters.resource}
            onValueChange={(value) =>
              setFilters({ ...filters, resource: value, page: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os recursos</SelectItem>
              {RESOURCES.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Filter */}
          <Select
            value={filters.action}
            onValueChange={(value) =>
              setFilters({ ...filters, action: value, page: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as ações</SelectItem>
              {ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="flex-1"
            >
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              className="flex-1"
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Ação
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Recurso
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                IP
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : data?.logs && data.logs.length > 0 ? (
              data.logs.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">
                    <div>
                      {format(new Date(log.createdAt), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div>{log.user.name}</div>
                    <div className="text-xs text-gray-500">{log.user.email}</div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{log.resource}</td>
                  <td className="px-6 py-3 text-sm font-mono text-xs">
                    {log.resourceId.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum log encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Página {data.page} de {data.totalPages} ({data.total} registros)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() =>
                setFilters({ ...filters, page: filters.page - 1 })
              }
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={filters.page >= data.totalPages}
              onClick={() =>
                setFilters({ ...filters, page: filters.page + 1 })
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
