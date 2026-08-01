'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSessionAction, getClientDashboardDataAction } from '@/src/actions/portal'
import { ClientSession } from '@/src/lib/portal/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign, 
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { clientLogoutAction } from '@/src/actions/portal'

export default function ClientDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<ClientSession | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Check session
        const sessionData = await getClientSessionAction()
        if (!sessionData) {
          router.push('/portal/auth/login')
          return
        }

        setSession(sessionData)

        // Load dashboard data
        const dashboardResult = await getClientDashboardDataAction()
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        }
      } catch (error) {
        console.error('[v0] Error loading portal data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await clientLogoutAction()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Portal AluERP</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/portal/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link href="/portal/obras" className="text-gray-700 hover:text-gray-900">
              Minhas Obras
            </Link>
            <Link href="/portal/documentos" className="text-gray-700 hover:text-gray-900">
              Documentos
            </Link>
            <Link href="/portal/financeiro" className="text-gray-700 hover:text-gray-900">
              Financeiro
            </Link>
            <Link href="/portal/mensagens" className="text-gray-700 hover:text-gray-900">
              Mensagens
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-2">
            <Link href="/portal/dashboard" className="block text-gray-700 hover:text-gray-900 py-2">
              Dashboard
            </Link>
            <Link href="/portal/obras" className="block text-gray-700 hover:text-gray-900 py-2">
              Minhas Obras
            </Link>
            <Link href="/portal/documentos" className="block text-gray-700 hover:text-gray-900 py-2">
              Documentos
            </Link>
            <Link href="/portal/financeiro" className="block text-gray-700 hover:text-gray-900 py-2">
              Financeiro
            </Link>
            <Link href="/portal/mensagens" className="block text-gray-700 hover:text-gray-900 py-2">
              Mensagens
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bem-vindo, {session?.clientName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Aqui você acompanha toda a situação de suas obras
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Obras em Andamento</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboardData?.inProgressWorks || 0}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Obra Concluída</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardData?.completedWorks || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orçamentos</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {dashboardData?.pendingQuotes || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Total Contratado</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {(dashboardData?.totalContracted / 1000).toFixed(1)}k
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendente</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    R$ {(dashboardData?.pendingPayments / 1000).toFixed(1)}k
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="obras" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="obras">Obras</TabsTrigger>
            <TabsTrigger value="documentos">Docs</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
          </TabsList>

          {/* Obras Tab */}
          <TabsContent value="obras" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Obras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">Reforma Residencial</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Em andamento
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Rua A, 123 - São Paulo, SP</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-semibold">65%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-[65%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">Nenhum documento disponível</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financeiro Tab */}
          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Situação Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">Nenhuma movimentação financeira</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividades Tab */}
          <TabsContent value="atividades">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentUpdates?.map((update: any) => (
                    <div key={update.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{update.title}</p>
                        <p className="text-sm text-gray-600">{update.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(update.timestamp).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
