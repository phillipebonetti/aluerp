'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { IntegrationCard } from '@/components/integrations/integration-card'
import {
  getCurrentCompanyIdAction,
  listIntegrationsAction,
  testConnectionAction,
  syncIntegrationAction,
  disconnectIntegrationAction
} from '@/src/actions/integrations'
import { IntegrationProvider } from '@/src/lib/integrations/types'
import { Zap, BarChart3, Lock, Code } from 'lucide-react'

const INTEGRATION_PROVIDERS = [
  {
    provider: IntegrationProvider.WHATSAPP,
    name: 'WhatsApp Business',
    category: 'Comunicação'
  },
  {
    provider: IntegrationProvider.EMAIL,
    name: 'Email (SMTP)',
    category: 'Comunicação'
  },
  {
    provider: IntegrationProvider.GOOGLE_CALENDAR,
    name: 'Google Calendar',
    category: 'Produtividade'
  },
  {
    provider: IntegrationProvider.GOOGLE_DRIVE,
    name: 'Google Drive',
    category: 'Armazenamento'
  },
  {
    provider: IntegrationProvider.CONTA_AZUL,
    name: 'Conta Azul',
    category: 'Financeiro'
  },
  {
    provider: IntegrationProvider.PIX_BANKING,
    name: 'PIX Bancário',
    category: 'Financeiro'
  },
  {
    provider: IntegrationProvider.BOLETO_BANKING,
    name: 'Boleto Bancário',
    category: 'Financeiro'
  },
  {
    provider: IntegrationProvider.ZAPIER,
    name: 'Zapier',
    category: 'Automação'
  },
  {
    provider: IntegrationProvider.MAKE,
    name: 'Make (Integromat)',
    category: 'Automação'
  }
]

interface IntegrationSummary {
  id: string
  provider: IntegrationProvider
  name: string
  status: string
  isActive: boolean
  lastSync?: Date | null
  lastError?: string | null
  _count?: { logs: number }
}

export default function IntegrationsDashboardPage() {
  const [integrations, setIntegrations] = useState<IntegrationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [companyId, setCompanyId] = useState<string | null>(null)

  const loadIntegrations = useCallback(async () => {
    setLoading(true)
    const currentCompanyId = companyId ?? await getCurrentCompanyIdAction()
    setCompanyId(currentCompanyId)
    if (!currentCompanyId) {
      setIntegrations([])
      setLoading(false)
      return
    }
    const result = await listIntegrationsAction(currentCompanyId)
    if (result.success) {
      setIntegrations(result.data || [])
    }
    setLoading(false)
  }, [companyId])

  // The initial fetch synchronizes the page with the server-backed integration state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIntegrations()
  }, [loadIntegrations])

  const handleTest = async (provider: IntegrationProvider) => {
    setActionLoading(`test-${provider}`)
    if (!companyId) return
    const result = await testConnectionAction(companyId, provider)
    if (result.success) {
      await loadIntegrations()
    }
    setActionLoading(null)
  }

  const handleSync = async (provider: IntegrationProvider) => {
    setActionLoading(`sync-${provider}`)
    if (!companyId) return
    const result = await syncIntegrationAction(companyId, provider)
    if (result.success) {
      await loadIntegrations()
    }
    setActionLoading(null)
  }

  const handleDisconnect = async (provider: IntegrationProvider) => {
    setActionLoading(`disconnect-${provider}`)
    if (!companyId) return
    const result = await disconnectIntegrationAction(companyId, provider)
    if (result.success) {
      await loadIntegrations()
    }
    setActionLoading(null)
  }

  const getIntegration = (provider: IntegrationProvider) => {
    return integrations.find(i => i.provider === provider)
  }

  const connected = integrations.filter(i => i.status === 'CONNECTED').length
  const total = INTEGRATION_PROVIDERS.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Integrações"
        description="Conecte e configure serviços externos para potencializar o AluERP"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Conectadas</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{connected}</p>
          <p className="text-xs text-gray-500 mt-1">de {total} disponíveis</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {integrations.filter(i => i.isActive).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">sincronizando</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Com Erro</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {integrations.filter(i => i.status === 'ERROR').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">requer atenção</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Desconectadas</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {integrations.filter(i => i.status === 'DISCONNECTED').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">não configuradas</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_PROVIDERS.map(({ provider, name }) => {
              const integration = getIntegration(provider)
              return (
                <Link key={provider} href={`/configuracoes/integracoes/${integration?.id || 'new'}`}>
                  <IntegrationCard
                    id={integration?.id || ''}
                    provider={provider}
                    name={name}
                    status={integration?.status || 'DISCONNECTED'}
                    lastSync={integration?.lastSync}
                    lastError={integration?.lastError}
                    isActive={integration?.isActive || false}
                    onConfigure={() => console.log('Configure', provider)}
                    onTest={() => handleTest(provider)}
                    onSync={() => handleSync(provider)}
                    onToggle={() => 
                      integration?.isActive 
                        ? handleDisconnect(provider)
                        : console.log('Connect', provider)
                    }
                    loading={actionLoading?.includes(provider) || loading}
                  />
                </Link>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_PROVIDERS.filter(p => p.category === 'Comunicação').map(({ provider, name }) => {
              const integration = getIntegration(provider)
              return (
                <IntegrationCard
                  key={provider}
                  id={integration?.id || ''}
                  provider={provider}
                  name={name}
                  status={integration?.status || 'DISCONNECTED'}
                  lastSync={integration?.lastSync}
                  lastError={integration?.lastError}
                  isActive={integration?.isActive || false}
                  loading={actionLoading?.includes(provider) || loading}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="productivity">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_PROVIDERS.filter(p => p.category === 'Produtividade').map(({ provider, name }) => {
              const integration = getIntegration(provider)
              return (
                <IntegrationCard
                  key={provider}
                  id={integration?.id || ''}
                  provider={provider}
                  name={name}
                  status={integration?.status || 'DISCONNECTED'}
                  lastSync={integration?.lastSync}
                  loading={actionLoading?.includes(provider) || loading}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_PROVIDERS.filter(p => p.category === 'Financeiro').map(({ provider, name }) => {
              const integration = getIntegration(provider)
              return (
                <IntegrationCard
                  key={provider}
                  id={integration?.id || ''}
                  provider={provider}
                  name={name}
                  status={integration?.status || 'DISCONNECTED'}
                  lastSync={integration?.lastSync}
                  loading={actionLoading?.includes(provider) || loading}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATION_PROVIDERS.filter(p => p.category === 'Automação').map(({ provider, name }) => {
              const integration = getIntegration(provider)
              return (
                <IntegrationCard
                  key={provider}
                  id={integration?.id || ''}
                  provider={provider}
                  name={name}
                  status={integration?.status || 'DISCONNECTED'}
                  lastSync={integration?.lastSync}
                  loading={actionLoading?.includes(provider) || loading}
                />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Webhooks */}
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Webhooks</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configure webhooks para receber eventos em tempo real
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Gerenciar Webhooks
          </Button>
        </div>

        {/* Monitoring */}
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Monitoramento</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Visualize logs e histórico de sincronizações
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Ver Logs
          </Button>
        </div>

        {/* API Tokens */}
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Tokens de API</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Crie e gerencie tokens para integrar externamente
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Gerenciar Tokens
          </Button>
        </div>

        {/* API Documentation */}
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold">API Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Documentação da API do AluERP para integrações
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Ver Documentação
          </Button>
        </div>
      </div>
    </div>
  )
}
