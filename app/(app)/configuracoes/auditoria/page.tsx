'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AuditLog, AuditModule, AuditAction } from '@prisma/client'
import {
  getAuditLogs,
  getAuditStats,
  exportAuditLogsCSV,
  getAuditLogDetail,
  getAuditUsers,
} from '@/src/actions/audit-logs'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileDown, Eye } from 'lucide-react'

const MODULES: Record<string, string> = {
  CLIENTS: 'Clientes',
  SUPPLIERS: 'Fornecedores',
  WORKS: 'Obras',
  WORK_ORDERS: 'Ordens de Serviço',
  BUDGETS: 'Orçamentos',
  EXPENSES: 'Despesas',
  REVENUES: 'Receitas',
  ACCOUNTS_PAYABLE: 'Contas a Pagar',
  ACCOUNTS_RECEIVABLE: 'Contas a Receber',
  USERS: 'Usuários',
  SETTINGS: 'Configurações',
}

const ACTIONS: Record<string, string> = {
  CREATE: 'Criado',
  UPDATE: 'Atualizado',
  DELETE: 'Deletado',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  EXPORT: 'Exportado',
  IMPORT: 'Importado',
  GENERATE_PDF: 'PDF Gerado',
  SEND_EMAIL: 'Email Enviado',
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  EXPORT: 'bg-yellow-100 text-yellow-800',
  IMPORT: 'bg-indigo-100 text-indigo-800',
}

interface Stats {
  totalActions: number
  actionsToday: number
  activeUsers: number
  loginsToday: number
  logsThisMonth: number
  topModules: Array<{ module: string; count: number }>
  topUsers: Array<{ userId: string; userName: string; count: number }>
}

export default function AuditPage() {
  const params = useParams()
  const companyId = typeof params?.companyId === 'string' ? params.companyId : ''

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any>(null)
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

  useEffect(() => {
    if (!companyId) return
    loadData()
  }, [companyId, filters, page])

  const loadData = async () => {
    setLoading(true)

    const [logsResult, statsResult, usersResult] = await Promise.all([
      getAuditLogs(
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
      getAuditStats(companyId),
      page === 1 ? getAuditUsers(companyId) : Promise.resolve({ success: true, data: users }),
    ])

    if (logsResult.success) {
      setLogs(logsResult.data.logs)
      setTotal(logsResult.data.total)
    }

    if (statsResult.success) {
      setStats(statsResult.data)
    }

    if (usersResult.success) {
      setUsers(usersResult.data)
    }

    setLoading(false)
  }

  const handleViewDetail = async (logId: string) => {
    const result = await getAuditLogDetail(companyId, logId)
    if (result.success) {
      setSelectedLog(result.data)
    }
  }

  const handleExport = async () => {
    const result = await exportAuditLogsCSV(companyId, {
      search: filters.search || undefined,
      userId: filters.userId || undefined,
      module: (filters.module as AuditModule) || undefined,
      action: (filters.action as AuditAction) || undefined,
    })

    if (result.success) {
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `auditoria_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
      link.click()
    }
  }

  const pages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" description="Histórico de todas as ações do sistema" />

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total de Ações (30 dias)</div>
            <div className="text-3xl font-bold mt-2">{stats.totalActions.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Ações Hoje</div>
            <div className="text-3xl font-bold mt-2">{stats.actionsToday}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Usuários Ativos</div>
            <div className="text-3xl font-bold mt-2">{stats.activeUsers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Logins Hoje</div>
            <div className="text-3xl font-bold mt-2">{stats.loginsToday}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Filtros e Busca</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por usuário, entidade, IP..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value })
              setPage(1)
            }}
          />

          <Select
            value={filters.userId}
            onValueChange={(v) => {
              setFilters({ ...filters, userId: v })
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os usuários</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.module}
            onValueChange={(v) => {
              setFilters({ ...filters, module: v })
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os módulos</SelectItem>
              {Object.entries(MODULES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.action}
            onValueChange={(v) => {
              setFilters({ ...filters, action: v })
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as ações</SelectItem>
              {Object.entries(ACTIONS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value })
              setPage(1)
            }}
            placeholder="Data inicial"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value })
              setPage(1)
            }}
            placeholder="Data final"
          />

          <Button onClick={handleExport} className="col-span-1 md:col-span-2 lg:col-span-4">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar para CSV
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
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
                  <TableHead>IP</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                      </TableCell>
                      <TableCell className="text-sm">{MODULES[log.module] || log.module}</TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100'}>
                          {ACTIONS[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.entity}</div>
                        {log.entityName && (
                          <div className="text-xs text-gray-500">{log.entityName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-xs">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(log.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando {(page - 1) * pageSize + 1} até{' '}
                  {Math.min(page * pageSize, total)} de {total.toLocaleString()}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
            <DialogDescription>
              {selectedLog?.entity} - {ACTIONS[selectedLog?.action]}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Usuário</div>
                  <div className="font-semibold">{selectedLog.userName}</div>
                  <div className="text-sm text-gray-600">{selectedLog.userEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Data/Hora</div>
                  <div className="font-semibold">
                    {format(new Date(selectedLog.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">IP</div>
                  <div className="font-mono text-sm">{selectedLog.ipAddress}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Navegador</div>
                  <div className="text-sm">{selectedLog.userAgent}</div>
                </div>
              </div>

              {/* Entity Info */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Informações da Entidade</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Módulo</div>
                    <div>{MODULES[selectedLog.module] || selectedLog.module}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Ação</div>
                    <div>
                      <Badge className={ACTION_COLORS[selectedLog.action]}>
                        {ACTIONS[selectedLog.action]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Entidade</div>
                    <div>{selectedLog.entity}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">ID</div>
                    <div className="font-mono text-xs">{selectedLog.entityId}</div>
                  </div>
                </div>
                {selectedLog.description && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-gray-600 mb-1">Descrição</div>
                    <div>{selectedLog.description}</div>
                  </div>
                )}
              </div>

              {/* JSON Comparison */}
              {(selectedLog.oldData || selectedLog.newData) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.oldData && (
                    <div>
                      <h4 className="font-semibold mb-2">Valores Anteriores</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newData && (
                    <div>
                      <h4 className="font-semibold mb-2">Valores Novos</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Changed Fields */}
              {selectedLog.changedFields && selectedLog.changedFields.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Campos Alterados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.changedFields.map((field: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
