'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/ui/page-header'
import { ChatInterface } from '@/components/ai/chat-interface'
import { Sparkles, Plus, Trash2, Pin, Archive, AlertCircle, TrendingUp } from 'lucide-react'
import { listConversationsAction, createConversationAction } from '@/src/actions/ai'

interface Conversation {
  id: string
  title: string
  category: string
  isPinned: boolean
  messageCount: number
  updatedAt: Date
}

export default function AIPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Insights de exemplo
  const insights = [
    {
      id: '1',
      title: 'Faturamento em alta',
      type: 'growth',
      severity: 'info',
      description: 'Faturamento cresceu 15% em relação ao mês anterior',
      metric: 'Faturamento: +15%'
    },
    {
      id: '2',
      title: 'Contas vencidas',
      type: 'warning',
      severity: 'warning',
      description: 'Você possui R$ 35.000 em contas a receber vencidas',
      metric: 'Contas: R$ 35.000'
    },
    {
      id: '3',
      title: 'Obra atrasada',
      type: 'warning',
      severity: 'critical',
      description: 'Obra "Reforma Apto 101" está 5 dias atrasada',
      metric: 'Atraso: 5 dias'
    },
    {
      id: '4',
      title: 'Novo cliente em potencial',
      type: 'opportunity',
      severity: 'info',
      description: 'Cliente "João Silva" realizou 3 orçamentos sem decisão',
      metric: 'Follow-up recomendado'
    }
  ]

  // Carregar conversas ao montar
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      // Em produção, pegar companyId e userId da sessão
      const result = await listConversationsAction('company-123', 'user-123')
      if (result.success && result.data) {
        setConversations(result.data as any)
        if (result.data.length > 0) {
          setSelectedConversation(result.data[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const result = await createConversationAction(
        'company-123',
        'user-123',
        `Nova conversa ${new Date().toLocaleDateString()}`,
        'general'
      )

      if (result.success && result.data) {
        const newConv = result.data as any
        setConversations(prev => [newConv, ...prev])
        setSelectedConversation(newConv.id)
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AluERP AI"
        description="Seu copiloto empresarial inteligente com insights, previsões e automações"
      />

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* TAB: CHAT */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Sidebar com conversas */}
            <div className="lg:col-span-1">
              <Card className="h-96">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Conversas</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={createNewConversation}
                      className="h-6 px-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="text-sm text-gray-500">Carregando...</div>
                  ) : conversations.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8">
                      Nenhuma conversa. Crie uma nova!
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <Button
                        key={conv.id}
                        variant={selectedConversation === conv.id ? 'default' : 'ghost'}
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-gray-500">{conv.messageCount} mensagens</p>
                        </div>
                      </Button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-96">
                <CardContent className="p-0 h-full">
                  {selectedConversation ? (
                    <ChatInterface conversationId={selectedConversation} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Crie uma nova conversa para começar</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB: INSIGHTS */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <Card key={insight.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {insight.description}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.severity}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-blue-600">{insight.metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: ANÁLISES */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Gráficos e análises detalhadas em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sugestões rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Perguntas rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            'Quantas obras estão em andamento?',
            'Qual cliente mais comprou este ano?',
            'Quanto faturamos este mês?',
            'Quais contas vencem hoje?'
          ].map((question, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {question}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
