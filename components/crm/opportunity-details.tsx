'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/crm/utils'
import {
  FileText,
  History,
  Activity,
  File,
  DollarSign,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  User,
  Clock,
  TrendingUp
} from 'lucide-react'

interface OpportunityDetailsProps {
  opportunity: any
  history: any[]
  activities: any[]
  quotes: any[]
  files: any[]
}

export function OpportunityDetails({
  opportunity,
  history,
  activities,
  quotes,
  files
}: OpportunityDetailsProps) {
  const [activeTab, setActiveTab] = useState('summary')

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      NEW_LEAD: 'bg-gray-100 text-gray-800',
      FIRST_CONTACT: 'bg-blue-100 text-blue-800',
      VISIT_SCHEDULED: 'bg-cyan-100 text-cyan-800',
      QUOTE_SENT: 'bg-purple-100 text-purple-800',
      NEGOTIATION: 'bg-amber-100 text-amber-800',
      CLOSED: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getProbabilityColor = (prob: number) => {
    if (prob < 20) return 'text-red-600'
    if (prob < 40) return 'text-orange-600'
    if (prob < 60) return 'text-yellow-600'
    if (prob < 80) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{opportunity.leadName}</h2>
            <p className="text-gray-600 mt-1">{opportunity.email}</p>
          </div>
          <Badge className={getStageColor(opportunity.stage)}>
            {opportunity.stage}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Valor</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(opportunity.value)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Probabilidade</p>
            <div className="mt-1">
              <p className={`text-2xl font-bold ${getProbabilityColor(opportunity.probability)}`}>
                {opportunity.probability}%
              </p>
              <Progress value={opportunity.probability} className="h-1 mt-1" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Criado em</p>
            <p className="text-sm font-semibold mt-1">
              {new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Responsável</p>
            <p className="text-sm font-semibold mt-1">{opportunity.responsible}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4" />
            <span>{opportunity.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.city}, {opportunity.state}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{opportunity.lastContactAt ? `Contato: ${new Date(opportunity.lastContactAt).toLocaleDateString()}` : 'Sem contato'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>Tempo: {opportunity.daysInStage || 0} dias</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Orçamentos ({quotes.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <File className="w-4 h-4" />
              Arquivos ({files.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Observações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor Estimado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(opportunity.value)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Esperada</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((opportunity.value * opportunity.probability) / 100)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Data Prevista de Fechamento</p>
                <p className="text-sm font-semibold">
                  {opportunity.expectedCloseDate 
                    ? new Date(opportunity.expectedCloseDate).toLocaleDateString('pt-BR')
                    : 'Não definida'
                  }
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-600">Nenhum histórico disponível</p>
              ) : (
                history.map((entry, idx) => (
                  <div key={idx} className="flex gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')} por {entry.user}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="p-6">
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-gray-600">Nenhuma atividade registrada</p>
              ) : (
                activities.map((activity, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{activity.type}: {activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.result && (
                      <p className="text-sm mt-2 p-2 bg-blue-50 rounded">
                        <strong>Resultado:</strong> {activity.result}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="p-6">
            <div className="space-y-3">
              {quotes.length === 0 ? (
                <p className="text-gray-600">Nenhum orçamento enviado</p>
              ) : (
                quotes.map((quote, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Orçamento #{quote.number}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(quote.value)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Enviado em {new Date(quote.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Visualizar
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="p-6">
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-gray-600">Nenhum arquivo anexado</p>
              ) : (
                files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="p-6">
            <p className="text-gray-600">{opportunity.notes || 'Nenhuma observação'}</p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
