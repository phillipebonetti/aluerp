'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { OSProductsTab } from '@/components/os/os-products-tab'
import { OSProductionTab } from '@/components/os/os-production-tab'
import { OSInstallationTab } from '@/components/os/os-installation-tab'
import { OSCommentsTab } from '@/components/os/os-comments-tab'
import { getServiceOrder, changeServiceOrderStatus } from '@/app/actions/os'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { ServiceOrderStatus } from '@/types/os'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function OSDetailPage() {
  const router = useRouter()
  const params = useParams()
  const osId = params.id as string

  const [os, setOS] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  useEffect(() => {
    async function loadOS() {
      try {
        setIsLoading(true)
        const data = await getServiceOrder(osId)
        setOS(data)
      } catch (error) {
        console.error('Error loading OS:', error)
        router.push('/os')
      } finally {
        setIsLoading(false)
      }
    }

    loadOS()
  }, [osId, router])

  async function handleStatusChange(newStatus: ServiceOrderStatus) {
    try {
      setIsChangingStatus(true)
      await changeServiceOrderStatus(osId, newStatus)
      const updatedOS = await getServiceOrder(osId)
      setOS(updatedOS)
    } catch (error) {
      console.error('Error changing status:', error)
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!os) {
    return <div className="p-6">Ordem de serviço não encontrada</div>
  }

  const statusOptions: ServiceOrderStatus[] = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{os.number}</h1>
            <p className="text-sm text-muted-foreground">{os.client?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="default">{os.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/os/${os.id}/editar`)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-semibold">{os.status}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Prioridade</p>
          <p className="text-lg font-semibold">{os.priority}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Data Agendada</p>
          <p className="text-lg font-semibold">{os.scheduledDate ? formatDate(os.scheduledDate) : '-'}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-lg font-semibold">{formatCurrency(os.totalValue)}</p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
          <TabsTrigger value="instalacao">Instalação</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <p className="mt-2 text-lg">{os.client?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendedor</label>
              <p className="mt-2 text-lg">{os.vendedor?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Obra</label>
              <p className="mt-2 text-lg">{os.project?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Orçamento</label>
              <p className="mt-2 text-lg">{os.quote?.number || '-'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <p className="mt-2 whitespace-pre-wrap">{os.description || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Observações</label>
            <p className="mt-2 whitespace-pre-wrap">{os.notes || '-'}</p>
          </div>
        </TabsContent>

        <TabsContent value="produtos">
          <OSProductsTab
            serviceOrderId={os.id}
            products={os.products || []}
            onProductAdded={(product) => {
              setOS({
                ...os,
                products: [...(os.products || []), product],
              })
            }}
            onProductDeleted={(productId) => {
              setOS({
                ...os,
                products: os.products?.filter((p: any) => p.id !== productId) || [],
              })
            }}
          />
        </TabsContent>

        <TabsContent value="producao">
          <OSProductionTab
            serviceOrderId={os.id}
            stages={os.productionStages || []}
            onStageAdded={(stage) => {
              setOS({
                ...os,
                productionStages: [...(os.productionStages || []), stage],
              })
            }}
            onStageUpdated={(stage) => {
              setOS({
                ...os,
                productionStages: os.productionStages?.map((s: any) => (s.id === stage.id ? stage : s)) || [],
              })
            }}
            onStageDeleted={(stageId) => {
              setOS({
                ...os,
                productionStages: os.productionStages?.filter((s: any) => s.id !== stageId) || [],
              })
            }}
          />
        </TabsContent>

        <TabsContent value="instalacao">
          <OSInstallationTab
            serviceOrderId={os.id}
            installation={os.installations?.[0] || null}
            onInstallationSaved={(installation) => {
              setOS({
                ...os,
                installations: [installation],
              })
            }}
          />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">{formatCurrency(os.totalValue)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Entrada</p>
              <p className="text-2xl font-bold">{formatCurrency(os.downPayment)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="text-2xl font-bold">{formatCurrency(os.balance)}</p>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Parcelas</p>
            <p className="text-lg font-semibold">{os.installments}x</p>
          </div>
        </TabsContent>

        <TabsContent value="comentarios">
          <OSCommentsTab
            serviceOrderId={os.id}
            comments={os.comments || []}
            onCommentAdded={(comment) => {
              setOS({
                ...os,
                comments: [comment, ...(os.comments || [])],
              })
            }}
          />
        </TabsContent>

        <TabsContent value="anexos" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">Funcionalidade de anexos em desenvolvimento</div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        {os.status !== 'COMPLETED' && os.status !== 'CANCELLED' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isChangingStatus}>Alterar Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusOptions
                .filter((s) => s !== os.status)
                .map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
