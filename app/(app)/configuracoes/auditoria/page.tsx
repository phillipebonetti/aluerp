'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getAuditLogsAction,
  getAuditStatisticsAction,
  getUsersForFilterAction,
  exportAuditLogsAction,
} from '@/src/actions/audit'
import { AuditLog, AuditModule, AuditAction } from '@prisma/client'
import { actionLabels, moduleLabels, AuditStatistics } from '@/src/lib/audit/types'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileDown, Search } from 'lucide-react'

export default function AuditPage() {
  const params = useParams()
  const companyId = Array.isArray(params?.companyId) ? params.companyId[0] : params?.companyId

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(50)

  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    module: '',
    action: '',
    startDate: '',
    endDate: '',
  })

  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    if (!companyId) return
    loadAuditData()
    loadUsers()
  }, [companyId, filters, page])

  const loadAuditData = async () => {
    if (!companyId) return
    setLoading(true)

    const [logsResult, statsResult] = await Promise.all([
      getAuditLogsAction(
        companyId,
        {
          search: filters.search || undefined,
          userId: filters.userId || undefined,
          module: (filters.module as AuditModule) || undefined,
          action: (filters.action as AuditAction) || undefined,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        },
        pageSize,
        (page - 1) * pageSize
      ),
      getAuditStatisticsAction(companyId),
    ])

    if (logsResult.success) {
      setLogs(logsResult.data.logs)
      setTotal(logsResult.data.total)
    }

    if (statsResult.success) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  const loadUsers = async () => {
    if (!companyId) return
    const result = await getUsersForFilterAction(companyId)
    if (result.success) {
      setUsers(result.data)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!companyId) return
    const result = await exportAuditLogsAction(companyId, format, {
      search: filters.search || undefined,
      userId: filters.userId || undefined,
      module: (filters.module as AuditModule) || undefined,
      action: (filters.action as AuditAction) || undefined,
    })

    if (result.success) {
      const blob = new Blob([result.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit_${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
    }
  }

  const pages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria"
        description="Visualize todas as ações realizadas no sistema"
      />

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total de Ações</div>
            <div className="text-2xl font-bold mt-1">{stats.totalActions.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">últimos 30 dias</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Usuários Ativos</div>
            <div className="text-2xl font-bold mt-1">{stats.activeUsers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Ações Hoje</div>
            <div className="text-2xl font-bold mt-1">{stats.actionsToday}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Logins Hoje</div>
            <div className="text-2xl font-bold mt-1">{stats.loginsToday}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Pesquisar</label>
            <Input
              placeholder="Nome, email, ID..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Usuário</label>
            <Select value={filters.userId} onValueChange={(v) => {
              setFilters({ ...filters, userId: v })
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os usuários</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.value} value={user.value}>
                    {user.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Módulo</label>
            <Select value={filters.module} onValueChange={(v) => {
              setFilters({ ...filters, module: v })
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os módulos</SelectItem>
                {Object.entries(moduleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Ação</label>
            <Select value={filters.action} onValueChange={(v) => {
              setFilters({ ...filters, action: v })
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Data Inicial</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value })
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Data Final</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value })
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Endereço IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(log.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{moduleLabels[log.module as any]}</TableCell>
                      <TableCell>
                        <span className="text-sm">{actionLabels[log.action as any]}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{log.entity}</div>
                        {log.entityName && <div className="text-xs text-gray-500">{log.entityName}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando {(page - 1) * pageSize + 1} até {Math.min(page * pageSize, total)} de{' '}
                  {total.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                      let pageNum = page - 2 + i
                      if (pageNum < 1) pageNum = i + 1
                      if (pageNum > pages) return null
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
