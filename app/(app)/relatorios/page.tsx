'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/reports/kpi-card'
import { ReportFilters } from '@/components/reports/report-filters'
import { getKPIsAction, getCashFlowAction, getCommercialMetricsAction, getTopSellersAction } from '@/src/actions/reports'
import { BarChart3, FileText, TrendingUp, DollarSign, Users, HardHat, Download, Share2 } from 'lucide-react'

const reportCards = [
  {
    title: 'Relatório Financeiro',
    description: 'DRE, fluxo de caixa e análise de lucratividade por período.',
    icon: DollarSign,
  },
  {
    title: 'Relatório de Obras',
    description: 'Progresso, custos e prazos de todas as obras em andamento.',
    icon: HardHat,
  },
  {
    title: 'Relatório de Clientes',
    description: 'Análise de carteira, ticket médio e recorrência de clientes.',
    icon: Users,
  },
  {
    title: 'Ranking de Vendedores',
    description: 'Performance, ticket médio e comissões da equipe comercial.',
    icon: TrendingUp,
  },
  {
    title: 'Análise de Orçamentos',
    description: 'Taxa de conversão, valores médios e motivos de perda.',
    icon: BarChart3,
  },
  {
    title: 'Fluxo de Caixa',
    description: 'Projeção financeira, entradas e saídas por período.',
    icon: FileText,
  },
]

export default function RelatoriosPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const companyId = 'temp-company-id' // Será obtido da sessão

  useEffect(() => {
    const loadKPIs = async () => {
      if (!companyId) return

      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const result = await getKPIsAction(companyId, startDate, endDate)
      if (result.success) {
        setKpis(result.data)
      }
      setLoading(false)
    }

    loadKPIs()
  }, [companyId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Relatórios & Business Intelligence"
          description="Dashboard executivo com indicadores em tempo real, análises profundas e exportações."
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="commercial">Comercial</TabsTrigger>
          <TabsTrigger value="works">Obras</TabsTrigger>
        </TabsList>

        {/* DASHBOARD EXECUTIVO */}
        <TabsContent value="dashboard" className="space-y-6">
          <ReportFilters />

          {/* KPI Cards - Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Receita Bruta"
              value={kpis ? `R$ ${(kpis.totalRevenue / 1000).toFixed(1)}k` : '—'}
              subtitle="Período atual"
              variant="success"
              loading={loading}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
            />
            <KPICard
              title="Lucro Líquido"
              value={kpis ? `R$ ${(kpis.profit / 1000).toFixed(1)}k` : '—'}
              subtitle="Após custos"
              variant="success"
              loading={loading}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            />
            <KPICard
              title="Margem (%)"
              value={kpis ? `${kpis.marginPercentage.toFixed(1)}%` : '—'}
              subtitle="Lucro / Receita"
              variant="default"
              loading={loading}
            />
            <KPICard
              title="Ticket Médio"
              value={kpis ? `R$ ${(kpis.averageTicket / 1000).toFixed(1)}k` : '—'}
              subtitle="Por oportunidade"
              variant="default"
              loading={loading}
            />
          </div>

          {/* KPI Cards - Fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Obras Ativas"
              value={kpis ? kpis.projectsInProgress : '—'}
              subtitle="Em andamento"
              variant="default"
              loading={loading}
              icon={<HardHat className="w-6 h-6 text-blue-600" />}
            />
            <KPICard
              title="Obras Finalizadas"
              value={kpis ? kpis.projectsCompleted : '—'}
              subtitle="Este mês"
              variant="success"
              loading={loading}
            />
            <KPICard
              title="Contas a Receber"
              value={kpis ? `R$ ${(kpis.receivables / 1000).toFixed(1)}k` : '—'}
              subtitle="Atrasadas"
              variant="warning"
              loading={loading}
              icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
            />
            <KPICard
              title="Contas a Pagar"
              value={kpis ? `R$ ${(kpis.payables / 1000).toFixed(1)}k` : '—'}
              subtitle="Vencidas"
              variant="danger"
              loading={loading}
              icon={<DollarSign className="w-6 h-6 text-red-600" />}
            />
          </div>

          {/* Relatórios Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Relatórios Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10">
                        <Icon className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">
                        {card.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Ver Relatório
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* RELATÓRIOS FINANCEIROS */}
        <TabsContent value="financial" className="space-y-6">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Seção de Relatórios Financeiros (DRE, Fluxo de Caixa, Contas) em desenvolvimento</p>
          </div>
        </TabsContent>

        {/* RELATÓRIOS COMERCIAIS */}
        <TabsContent value="commercial" className="space-y-6">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Seção de Relatórios Comerciais (Conversão, Vendedores, Clientes) em desenvolvimento</p>
          </div>
        </TabsContent>

        {/* RELATÓRIOS DE OBRAS */}
        <TabsContent value="works" className="space-y-6">
          <div className="p-6 border rounded-lg text-center text-muted-foreground">
            <p>Seção de Relatórios de Obras (Cronograma, Custos, Performance) em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
