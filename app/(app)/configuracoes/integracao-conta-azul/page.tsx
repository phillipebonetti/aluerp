'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { saveContaAzulConfig, syncContaAzulData, getContaAzulStatus } from '@/src/actions/conta-azul'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function ContaAzulIntegrationPage() {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    accessToken: '',
    refreshToken: '',
  })

  const [selectedEntities, setSelectedEntities] = useState({
    clientes: true,
    fornecedores: true,
    produtos: true,
    categorias: true,
    notasFiscais: true,
    contasPagar: true,
    contasReceber: true,
    centrosCusto: true,
  })

  const handleSave = async () => {
    setLoading(true)
    const result = await saveContaAzulConfig(
      formData.clientId,
      formData.clientSecret,
      formData.accessToken,
      formData.refreshToken
    )

    if (result.success) {
      alert('Configuração salva com sucesso!')
    } else {
      alert(`Erro: ${result.error}`)
    }
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    const entities = Object.keys(selectedEntities).filter(k => selectedEntities[k as keyof typeof selectedEntities])
    const result = await syncContaAzulData(entities)

    if (result.success) {
      alert('Sincronização concluída!')
      console.log(result.data)
    } else {
      alert(`Erro: ${result.error}`)
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Integração Conta Azul" description="Configure e sincronize dados com Conta Azul" />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Credenciais de Acesso</h2>

        <div className="space-y-4 mb-6">
          <div>
            <Label>Client ID</Label>
            <Input
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="Seu Client ID"
            />
          </div>

          <div>
            <Label>Client Secret</Label>
            <Input
              type="password"
              value={formData.clientSecret}
              onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
              placeholder="Seu Client Secret"
            />
          </div>

          <div>
            <Label>Access Token</Label>
            <Input
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              placeholder="Token de acesso"
            />
          </div>

          <div>
            <Label>Refresh Token</Label>
            <Input
              type="password"
              value={formData.refreshToken}
              onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
              placeholder="Refresh token"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Entidades para Sincronizar</h2>

        <div className="space-y-3 mb-6">
          {Object.entries({
            clientes: 'Clientes',
            fornecedores: 'Fornecedores',
            produtos: 'Produtos',
            categorias: 'Categorias',
            notasFiscais: 'Notas Fiscais',
            contasPagar: 'Contas a Pagar',
            contasReceber: 'Contas a Receber',
            centrosCusto: 'Centros de Custo',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                checked={selectedEntities[key as keyof typeof selectedEntities]}
                onCheckedChange={(checked) =>
                  setSelectedEntities({
                    ...selectedEntities,
                    [key]: checked,
                  })
                }
              />
              <Label className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>

        <Button onClick={handleSync} disabled={syncing} className="w-full" variant="secondary">
          {syncing ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            'Sincronizar Agora'
          )}
        </Button>
      </Card>

      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Como obter credenciais</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Acesse sua conta Conta Azul</li>
              <li>Vá para Integrações &gt; API</li>
              <li>Crie uma nova aplicação</li>
              <li>Copie os tokens de acesso</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}
