'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info, AlertTriangle, Zap, Search, Download, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/src/utils/dashboard'

interface IntegrationLog {
  id: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  errorMessage?: string
  createdAt: Date
}

interface IntegrationLogsProps {
  logs: IntegrationLog[]
  loading?: boolean
  onRefresh?: () => Promise<void>
  onExport?: () => void
}

export function IntegrationLogs({
  logs,
  loading = false,
  onRefresh,
  onExport
}: IntegrationLogsProps) {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<IntegrationLog | null>(null)

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (search && !log.endpoint?.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (levelFilter && log.level !== levelFilter) {
        return false
      }
      return true
    })
  }, [logs, search, levelFilter])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-600" />
      case 'DEBUG':
        return <Zap className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <Badge className="bg-red-100 text-red-800">{level}</Badge>
      case 'WARNING':
        return <Badge className="bg-yellow-100 text-yellow-800">{level}</Badge>
      case 'INFO':
        return <Badge className="bg-blue-100 text-blue-800">{level}</Badge>
      case 'DEBUG':
        return <Badge className="bg-gray-100 text-gray-800">{level}</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'text-gray-500'
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600'
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Integration Logs</CardTitle>
            <CardDescription>
              Monitor all integration activities and errors
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by endpoint..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-1">
            {['INFO', 'WARNING', 'ERROR', 'DEBUG'].map(level => (
              <Button
                key={level}
                variant={levelFilter === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLevelFilter(levelFilter === level ? null : level)}
                className="gap-1"
              >
                {getLevelIcon(level)}
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-20">Level</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead className="w-16">Method</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-24">Duration</TableHead>
                <TableHead className="w-32">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => (
                  <TableRow
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell>
                      {getLevelBadge(log.level)}
                    </TableCell>
                    <TableCell className="font-mono text-sm truncate">
                      {log.endpoint}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {log.method}
                    </TableCell>
                    <TableCell className={`font-medium text-sm ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.duration ? `${log.duration}ms` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedLog && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold">Log Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Level</p>
                <p>{getLevelBadge(selectedLog.level)}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Status Code</p>
                <p className={getStatusColor(selectedLog.statusCode)}>
                  {selectedLog.statusCode || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 font-medium">Endpoint</p>
                <code className="bg-white border rounded px-2 py-1 block mt-1 truncate">
                  {selectedLog.endpoint}
                </code>
              </div>
              {selectedLog.errorMessage && (
                <div className="col-span-2 bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-gray-600 font-medium text-xs">Error</p>
                  <p className="text-red-700 text-sm mt-1">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
