'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { IntegrationConfigModal } from '@/components/integrations/integration-config-modal'
import { WebhooksPanel } from '@/components/integrations/webhooks-panel'
import { ApiTokensPanel } from '@/components/integrations/api-tokens-panel'
import { IntegrationLogs } from '@/components/integrations/integration-logs'
import { IntegrationProvider, IntegrationStatus } from '@/src/lib/integrations/types'
import {
  getCurrentCompanyIdAction,
  listIntegrationsAction,
  getIntegrationLogsAction,
  testConnectionAction,
  syncIntegrationAction,
  createWebhookAction,
  listWebhooksAction,
  listApiTokensAction,
} from '@/src/actions/integrations'
import { formatDate } from '@/src/utils/dashboard'

interface IntegrationDetail {
  id: string
  provider: IntegrationProvider
  name: string
  status: IntegrationStatus
  isActive: boolean
  lastSync?: Date
  lastError?: string
  createdAt: Date
  webhooks: Array<Record<string, unknown>>
  logs: Array<Record<string, unknown>>
  apiTokens: Array<Record<string, unknown>>
}

export default function IntegrationDetailPage() {
  const params = useParams()
  const integrationId = params.id as string

  const [integration, setIntegration] = useState<IntegrationDetail | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    let active = true
    async function loadIntegration() {
      const companyId = await getCurrentCompanyIdAction()
      if (active) setCompanyId(companyId)
      if (!companyId) {
        if (active) setLoading(false)
        return
      }
      const result = await listIntegrationsAction(companyId)
      const current = result.success ? result.data.find((item) => item.id === integrationId) : null
      if (!current) {
        if (active) setLoading(false)
        return
      }
      const [logsResult, webhooksResult, tokensResult] = await Promise.all([
        getIntegrationLogsAction(companyId, current.provider as IntegrationProvider),
        listWebhooksAction(current.id),
        listApiTokensAction(companyId),
      ])
      if (active) {
        setIntegration({
          ...current,
          createdAt: current.enabledAt ?? new Date(),
          webhooks: webhooksResult.success ? webhooksResult.data.map((webhook) => ({
            ...webhook,
            events: typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events,
          })) : [],
          logs: logsResult.success ? logsResult.data : [],
          apiTokens: tokensResult.success ? tokensResult.data.map((token) => ({
            ...token,
            token: '',
            permissions: typeof token.permissions === 'string' ? JSON.parse(token.permissions) : token.permissions,
          })) : [],
        })
        setLoading(false)
      }
    }
    void loadIntegration()
    return () => { active = false }
  }, [integrationId])

  const handleTestConnection = async () => {
    if (!companyId || !integration) return
    setTestingConnection(true)
    const result = await testConnectionAction(companyId, integration.provider)
    if (result.success && result.connected) {
      setIntegration({ ...integration, status: 'CONNECTED' as IntegrationStatus, lastError: undefined })
    }
    setTestingConnection(false)
  }

  const handleSyncNow = async () => {
    if (!companyId || !integration) return
    setTestingConnection(true)
    const result = await syncIntegrationAction(companyId, integration.provider)
    if (result.success) {
      setIntegration({ ...integration, lastSync: new Date(), lastError: undefined })
    }
    setTestingConnection(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!integration) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Integration not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracoes/integracoes">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <PageHeader
          title={integration.name}
          description={`Provider: ${integration.provider}`}
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                integration.status === 'CONNECTED' ? 'bg-green-600' : 'bg-yellow-600'
              }`} />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{integration.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="font-semibold">
                {integration.lastSync ? formatDate(integration.lastSync) : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="font-semibold">
                  {integration.isActive ? 'Yes' : 'No'}
                </p>
              </div>
              <Badge className={integration.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {integration.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setShowConfig(true)} className="gap-2">
          Configure
        </Button>
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="gap-2"
        >
          {testingConnection && <Loader2 className="w-4 h-4 animate-spin" />}
          Test Connection
        </Button>
        <Button
          variant="outline"
          onClick={handleSyncNow}
          disabled={testingConnection}
          className="gap-2"
        >
          {testingConnection && <Loader2 className="w-4 h-4 animate-spin" />}
          Sync Now
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="tokens">API Tokens</TabsTrigger>
          <TabsTrigger value="logs">Logs ({integration.logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <WebhooksPanel
            integrationId={integration.id}
            webhooks={integration.webhooks}
            onAdd={async ({ url, events }) => {
              if (!companyId) throw new Error('Empresa não encontrada')
              const result = await createWebhookAction(companyId, integration.id, url, events)
              if (!result.success) throw new Error(result.error)
              setIntegration((current) => current ? { ...current, webhooks: [...current.webhooks, result.data] } : current)
            }}
            onDelete={async () => {
              throw new Error('A exclusão de webhooks ainda não está disponível')
            }}
            onToggle={async () => {
              throw new Error('A alteração de status de webhooks ainda não está disponível')
            }}
          />
        </TabsContent>

        <TabsContent value="tokens">
          <ApiTokensPanel
            tokens={integration.apiTokens}
            onCreate={async () => 'mock-token'}
            onDelete={async () => {}}
          />
        </TabsContent>

        <TabsContent value="logs">
          <IntegrationLogs
            logs={integration.logs}
            onRefresh={async () => {}}
            onExport={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <IntegrationConfigModal
        open={showConfig}
        onOpenChange={setShowConfig}
        provider={integration.provider}
        onSave={async (credentials) => {
          console.log('Saving credentials:', credentials)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }}
      />
    </div>
  )
}
