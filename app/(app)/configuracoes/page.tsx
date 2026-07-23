import { PageHeader } from '@/components/ui/page-header'
import {
  Building2,
  Users,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Globe,
  Webhook,
  ChevronRight,
} from 'lucide-react'

const settingsSections = [
  {
    category: 'Empresa',
    items: [
      { icon: Building2, title: 'Dados da Empresa', description: 'Razão social, CNPJ, endereço e logo.', badge: null },
      { icon: Users, title: 'Usuários e Permissões', description: 'Gerencie membros da equipe e níveis de acesso.', badge: 'Plano Pro' },
    ],
  },
  {
    category: 'Sistema',
    items: [
      { icon: Palette, title: 'Aparência', description: 'Tema, cores e preferências visuais.', badge: null },
      { icon: Bell, title: 'Notificações', description: 'Configure alertas de OS, vencimentos e eventos.', badge: null },
      { icon: Globe, title: 'Localização', description: 'Moeda, fuso horário e formato de data.', badge: null },
    ],
  },
  {
    category: 'Conta e Faturamento',
    items: [
      { icon: CreditCard, title: 'Plano e Assinatura', description: 'Veja seu plano atual e gerencie a assinatura.', badge: null },
      { icon: Shield, title: 'Segurança', description: 'Senha, autenticação em dois fatores e sessões ativas.', badge: null },
    ],
  },
  {
    category: 'Integrações',
    items: [
      { icon: Webhook, title: 'APIs e Integrações', description: 'Conecte o AluERP a ferramentas externas.', badge: 'Em breve' },
    ],
  },
]

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <PageHeader
        title="Configurações"
        description="Personalize o sistema de acordo com as necessidades da sua empresa."
      />

      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {section.category}
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.title}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
