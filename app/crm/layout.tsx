import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { BarChart3, Users, Target, Calendar, History } from 'lucide-react'

export default function CRMLayout({
  children
}: {
  children: React.ReactNode
}) {
  const tabs = [
    { href: '/crm', label: 'Dashboard', icon: BarChart3 },
    { href: '/crm/leads', label: 'Leads', icon: Users },
    { href: '/crm/pipeline', label: 'Pipeline', icon: Target },
    { href: '/crm/oportunidades', label: 'Oportunidades', icon: Target },
    { href: '/crm/agenda', label: 'Agenda', icon: Calendar },
    { href: '/crm/historico', label: 'Histórico', icon: History }
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="/crm" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.href} asChild value={tab.href}>
                <Link href={tab.href} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
