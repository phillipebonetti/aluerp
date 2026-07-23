import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart3, FileText, TrendingUp, DollarSign, Users, HardHat } from 'lucide-react'
import Link from 'next/link'

const reportCards = [
  {
    title: 'Relatório Financeiro',
    description: 'DRE, fluxo de caixa e análise de lucratividade por período.',
    icon: DollarSign,
    status: 'Em breve',
  },
  {
    title: 'Relatório de Obras',
    description: 'Progresso, custos e prazos de todas as obras em andamento.',
    icon: HardHat,
    status: 'Em breve',
  },
  {
    title: 'Relatório de Clientes',
    description: 'Análise de carteira, ticket médio e recorrência de clientes.',
    icon: Users,
    status: 'Em breve',
  },
  {
    title: 'Relatório de OS',
    description: 'Performance das ordens de serviço e produtividade da equipe.',
    icon: FileText,
    status: 'Em breve',
  },
  {
    title: 'Análise de Orçamentos',
    description: 'Taxa de conversão, valores médios e perdas de orçamento.',
    icon: TrendingUp,
    status: 'Em breve',
  },
]

export default function RelatoriosPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análises e indicadores de desempenho da empresa em um só lugar."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {card.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">{card.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
