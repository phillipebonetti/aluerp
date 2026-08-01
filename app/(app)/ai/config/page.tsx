'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Settings, Key, Database } from 'lucide-react'

interface ProviderConfig {
  provider: string
  name: string
  description: string
  isConfigured: boolean
  endpoint?: string
  modelId?: string
}

export default function AIConfigPage() {
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({
    openai: {
      provider: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5, e modelos mais avançados da OpenAI',
      isConfigured: false,
      modelId: 'gpt-4'
    },
    anthropic: {
      provider: 'anthropic',
      name: 'Anthropic',
      description: 'Claude 3 e modelos anteriores do Anthropic',
      isConfigured: false,
      modelId: 'claude-3-opus'
    },
    gemini: {
      provider: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini Pro e modelos do Google Cloud',
      isConfigured: false,
      modelId: 'gemini-pro'
    },
    azure: {
      provider: 'azure',
      name: 'Azure OpenAI',
      description: 'OpenAI via infraestrutura Microsoft Azure',
      isConfigured: false,
      endpoint: 'https://your-resource.openai.azure.com',
      modelId: 'gpt-4'
    },
    ollama: {
      provider: 'ollama',
      name: 'Ollama (Local)',
      description: 'Modelos de IA executados localmente',
      isConfigured: false,
      endpoint: 'http://localhost:11434',
      modelId: 'llama2'
    }
  })

  const currentConfig = configs[selectedProvider]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuração de IA"
        description="Configure seu provedor de IA preferido para potencializar o assistente"
      />

      <Tabs value={selectedProvider} onValueChange={setSelectedProvider} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.values(configs).map(config => (
            <TabsTrigger key={config.provider} value={config.provider} className="flex items-center gap-1 text-xs">
              {config.isConfigured ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-gray-400" />
              )}
              <span className="hidden sm:inline">{config.name}</span>
              <span className="sm:hidden">{config.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(configs).map(([key, config]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config.isConfigured ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Configurado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Não configurado</span>
                      </>
                    )}
                  </div>
                  <Badge variant={config.isConfigured ? 'default' : 'outline'}>
                    {config.isConfigured ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.endpoint && (
                  <div>
                    <Label>Endpoint da API</Label>
                    <Input
                      type="text"
                      placeholder="https://api.example.com"
                      defaultValue={config.endpoint}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL base para chamadas da API
                    </p>
                  </div>
                )}

                <div>
                  <Label>Chave da API</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sua chave de acesso (criptografada)
                  </p>
                </div>

                <div>
                  <Label>ID do Modelo</Label>
                  <Input
                    type="text"
                    placeholder={config.modelId}
                    defaultValue={config.modelId}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Qual modelo usar para requisições
                  </p>
                </div>

                {/* Temperature and other params */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperatura (0-1)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.7"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      defaultValue="2048"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Top P (0-1)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.9"
                    className="mt-1"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button>
                    <Key className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </Button>
                  <Button variant="outline">
                    Testar Conexão
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-900 dark:text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  Como obter a chave?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                {key === 'openai' && (
                  <>
                    <p>1. Acesse <a href="https://platform.openai.com/api-keys" className="underline">platform.openai.com/api-keys</a></p>
                    <p>2. Clique em "Create new secret key"</p>
                    <p>3. Copie a chave gerada (ela aparecerá apenas uma vez)</p>
                  </>
                )}
                {key === 'anthropic' && (
                  <>
                    <p>1. Acesse <a href="https://console.anthropic.com/" className="underline">console.anthropic.com</a></p>
                    <p>2. Vá para a seção de API Keys</p>
                    <p>3. Crie uma nova chave e copie</p>
                  </>
                )}
                {key === 'gemini' && (
                  <>
                    <p>1. Acesse <a href="https://ai.google.dev" className="underline">ai.google.dev</a></p>
                    <p>2. Clique em "Get API Key"</p>
                    <p>3. Crie uma nova chave do projeto</p>
                  </>
                )}
                {key === 'azure' && (
                  <>
                    <p>1. Acesse seu Azure Portal</p>
                    <p>2. Crie um recurso OpenAI</p>
                    <p>3. Copie a chave e endpoint</p>
                  </>
                )}
                {key === 'ollama' && (
                  <>
                    <p>1. Instale Ollama de <a href="https://ollama.ai" className="underline">ollama.ai</a></p>
                    <p>2. Execute: <code className="bg-black/20 px-2 py-1 rounded">ollama serve</code></p>
                    <p>3. Deve estar rodando em http://localhost:11434</p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Uso de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Este Mês</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">tokens usados</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Estimado</p>
              <p className="text-2xl font-bold">$0</p>
              <p className="text-xs text-gray-500">custo aproximado</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Limite</p>
              <p className="text-2xl font-bold">∞</p>
              <p className="text-xs text-gray-500">sem limite</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
