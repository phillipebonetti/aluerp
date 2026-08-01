'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  createBackupAction,
  restoreBackupAction,
  listBackupsAction,
  getBackupConfigAction,
  updateBackupConfigAction,
  deleteBackupAction,
  getBackupStatsAction,
} from '@/src/actions/backup'
import { BackupFrequency, Backup, BackupConfiguration } from '@prisma/client'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Download, RotateCw, Trash2, Plus } from 'lucide-react'

export default function BackupPage() {
  const params = useParams()
  const companyId = typeof params?.companyId === 'string' ? params.companyId : ''

  const [backups, setBackups] = useState<Backup[]>([])
  const [config, setConfig] = useState<BackupConfiguration | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null)
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (companyId) {
      loadData()
    }
  }, [companyId, page])

  const loadData = async () => {
    setLoading(true)
    const [backupsResult, configResult, statsResult] = await Promise.all([
      listBackupsAction(companyId, page),
      getBackupConfigAction(companyId),
      getBackupStatsAction(companyId),
    ])

    if (backupsResult.success) setBackups(backupsResult.data.backups)
    if (configResult.success) setConfig(configResult.data)
    if (statsResult.success) setStats(statsResult.data)
    setLoading(false)
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    const result = await createBackupAction(companyId, 'current-user-id')
    if (result.success) {
      await loadData()
    }
    setCreatingBackup(false)
  }

  const handleRestore = async (backup: Backup) => {
    setSelectedBackup(backup)
    setShowRestoreConfirm(true)
  }

  const confirmRestore = async () => {
    if (!selectedBackup) return
    setRestoringBackup(selectedBackup.id)
    const result = await restoreBackupAction(companyId, selectedBackup.id, 'current-user-id')
    if (result.success) {
      await loadData()
    }
    setRestoringBackup(null)
    setShowRestoreConfirm(false)
    setSelectedBackup(null)
  }

  const handleDelete = async (backupId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este backup?')) return
    setDeletingBackup(backupId)
    const result = await deleteBackupAction(companyId, backupId)
    if (result.success) {
      await loadData()
    }
    setDeletingBackup(null)
  }

  const handleConfigUpdate = async (frequency: BackupFrequency, hour: number) => {
    const result = await updateBackupConfigAction(companyId, frequency, hour)
    if (result.success) {
      setConfig(result.data)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Backup e Restauração" description="Gerencia backups do seu sistema" />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total de Backups</div>
            <div className="text-3xl font-bold mt-2">{stats.totalBackups}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Backups Completos</div>
            <div className="text-3xl font-bold mt-2">{stats.completedBackups}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Tamanho Total</div>
            <div className="text-3xl font-bold mt-2">{formatBytes(stats.totalSize)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Falhados</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{stats.failedBackups}</div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="backups" className="w-full">
        <TabsList>
          <TabsTrigger value="backups">Histórico de Backups</TabsTrigger>
          <TabsTrigger value="config">Configuração Automática</TabsTrigger>
        </TabsList>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Backups Disponíveis</h3>
            <Button onClick={handleCreateBackup} disabled={creatingBackup}>
              <Plus className="h-4 w-4 mr-2" />
              {creatingBackup ? 'Criando...' : 'Novo Backup'}
            </Button>
          </div>

          <Card>
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criado Por</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Nenhum backup encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="text-sm">
                          {format(new Date(backup.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {backup.size ? formatBytes(Number(backup.size)) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{backup.type}</TableCell>
                        <TableCell className="text-sm">{backup.createdByName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {backup.status === 'COMPLETED' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestore(backup)}
                                  disabled={restoringBackup === backup.id}
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(backup.id)}
                              disabled={deletingBackup === backup.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Configurar Backup Automático</h3>

            {config && (
              <div className="space-y-6">
                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Backups automáticos serão criados nos horários
                    configurados. Certifique-se de ter espaço suficiente no servidor.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frequency */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Frequência</label>
                    <Select
                      value={config.frequency}
                      onValueChange={(value) =>
                        handleConfigUpdate(value as BackupFrequency, config.scheduledHour)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="DAILY">Diariamente</SelectItem>
                        <SelectItem value="WEEKLY">Semanalmente</SelectItem>
                        <SelectItem value="MONTHLY">Mensalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheduled Hour */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Horário (0-23)</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={config.scheduledHour}
                      onChange={(e) =>
                        handleConfigUpdate(config.frequency, parseInt(e.target.value))
                      }
                    />
                  </div>

                  {/* Retention Days */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Reter últimos N backups
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={config.retainBackups}
                      disabled
                    />
                  </div>

                  {/* Auto Delete */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Auto-delete</label>
                    <div className="text-sm text-gray-600">
                      {config.autoDelete ? 'Ativado' : 'Desativado'}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Próximo backup:</strong> Será realizado automaticamente de acordo com a
                  frequência configurada.
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Restauração</DialogTitle>
            <DialogDescription>
              Esta ação restaurará todos os dados do backup selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-900 mb-2">Aviso Importante</div>
              <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                <li>Todos os dados atuais serão sobrescitos</li>
                <li>Um backup automático será criado do estado atual como segurança</li>
                <li>O processo pode levar vários minutos</li>
                <li>Nenhuma ação poderá ser desfeita manualmente</li>
              </ul>
            </div>

            {selectedBackup && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm">
                  <div className="text-gray-600">Data do backup:</div>
                  <div className="font-semibold">
                    {format(new Date(selectedBackup.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRestore}
              disabled={restoringBackup !== null}
            >
              {restoringBackup ? 'Restaurando...' : 'Restaurar Agora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
