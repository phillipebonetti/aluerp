'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSessionAction, getClientWorksAction } from '@/src/actions/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User,
  TrendingUp,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function ClientWorksPage() {
  const router = useRouter()
  const [works, setWorks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWork, setSelectedWork] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorks() {
      try {
        const sessionData = await getClientSessionAction()
        if (!sessionData) {
          router.push('/portal/auth/login')
          return
        }

        const result = await getClientWorksAction()
        if (result.success && result.data) {
          setWorks(result.data)
          setSelectedWork(result.data[0]?.id)
        }
      } catch (error) {
        console.error('[v0] Error loading works:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorks()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full lg:col-span-1" />
            <Skeleton className="h-64 w-full lg:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  const selectedWorkData = works.find(w => w.id === selectedWork)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Minhas Obras</h1>
          </div>
          <p className="text-gray-600">
            Acompanhe o progresso de todas as suas obras em tempo real
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Works List */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {works.map(work => (
                <button
                  key={work.id}
                  onClick={() => setSelectedWork(work.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedWork === work.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{work.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
                      work.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      work.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {work.status === 'COMPLETED' ? 'Concluída' :
                       work.status === 'IN_PROGRESS' ? 'Em andamento' :
                       'Planejamento'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {work.address}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Work Details */}
          {selectedWorkData && (
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedWorkData.name}</CardTitle>
                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <MapPin className="w-4 h-4" />
                        {selectedWorkData.address}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${
                      selectedWorkData.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      selectedWorkData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedWorkData.status === 'COMPLETED' ? 'Concluída' :
                       selectedWorkData.status === 'IN_PROGRESS' ? 'Em andamento' :
                       'Planejamento'}
                    </span>
                  </div>
                </CardHeader>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progresso da Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{selectedWorkData.progress}% Concluído</span>
                      <span className="text-sm text-gray-600">
                        Próxima: {selectedWorkData.nextMilestone}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${selectedWorkData.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Etapas</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Fundação', status: 'COMPLETED' },
                        { name: 'Alvenaria', status: 'COMPLETED' },
                        { name: 'Cobertura', status: 'IN_PROGRESS' },
                        { name: 'Acabamento Interno', status: 'PENDING' },
                        { name: 'Acabamento Externo', status: 'PENDING' }
                      ].map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            milestone.status === 'COMPLETED' ? 'bg-green-600' :
                            milestone.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                            'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{milestone.name}</p>
                            <p className={`text-xs ${
                              milestone.status === 'COMPLETED' ? 'text-green-600' :
                              milestone.status === 'IN_PROGRESS' ? 'text-blue-600' :
                              'text-gray-500'
                            }`}>
                              {milestone.status === 'COMPLETED' ? 'Concluída' :
                               milestone.status === 'IN_PROGRESS' ? 'Em andamento' :
                               'Pendente'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Data Prevista</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {new Date(selectedWorkData.expectedEndDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Responsável</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedWorkData.responsible}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Documentos</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedWorkData.documents} arquivos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Fotos</p>
                        <p className="font-semibold text-gray-900 mt-1">{selectedWorkData.photos} fotos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/portal/fotos/${selectedWorkData.id}`}>
                    Ver Galeria
                  </Link>
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/portal/documentos/${selectedWorkData.id}`}>
                    Documentos
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
