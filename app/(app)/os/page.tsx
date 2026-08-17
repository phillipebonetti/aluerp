'use client'

import { useEffect, useState } from 'react'
import { getCurrentCompanyIdAction } from '@/src/actions/integrations'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OSTable } from '@/components/os/os-table'
import { listServiceOrders } from '@/app/actions/os'
import type { ServiceOrderStatus } from '@/src/types/os'
import { Search } from 'lucide-react'

export default function OSPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [skip, setSkip] = useState(0)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const take = 10

  async function loadData() {
    if (!companyId) return
    try {
      setIsLoading(true)
      const result = await listServiceOrders(companyId, {
        searchTerm: searchTerm || undefined,
        status: (statusFilter as ServiceOrderStatus) || undefined,
        skip,
        take,
      })
      setData(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('Error loading OSs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void getCurrentCompanyIdAction().then((id) => {
      if (active) setCompanyId(id)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (companyId) void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, skip])

  function handleSearch() {
    setSkip(0)
    setPage(1)
    loadData()
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setSkip(0)
    setPage(1)
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Controle todas as ordens de serviço, status de execução e progresso."
        action={{ label: 'Nova OS', href: '/os/novo' }}
      />

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-64 flex gap-2">
            <Input
              placeholder="Buscar por número, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="SCHEDULED">Agendado</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <OSTable
          data={data}
          isLoading={isLoading}
          onView={(id) => router.push(`/os/${id}`)}
          onEdit={(id) => router.push(`/os/${id}/editar`)}
          onDelete={() => {
            window.alert('A exclusão de OS ainda não possui uma action de servidor implementada.')
          }}
        />

        {total > take && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1} a {Math.min(skip + take, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={skip === 0}
                onClick={() => {
                  setSkip(Math.max(0, skip - take))
                  setPage(Math.max(1, page - 1))
                  loadData()
                }}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={skip + take >= total}
                onClick={() => {
                  setSkip(skip + take)
                  setPage(page + 1)
                  loadData()
                }}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
