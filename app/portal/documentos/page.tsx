'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSessionAction, getClientDocumentsAction } from '@/src/actions/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download,
  Eye,
  File,
  FileCode,
  ReceiptText
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ClientDocumentosPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDocuments() {
      try {
        const sessionData = await getClientSessionAction()
        if (!sessionData) {
          router.push('/portal/auth/login')
          return
        }

        const result = await getClientDocumentsAction()
        if (result.success && result.data) {
          setDocuments(result.data)
        }
      } catch (error) {
        console.error('[v0] Error loading documents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const documentsByType = {
    CONTRACT: documents.filter(d => d.type === 'CONTRACT'),
    BUDGET: documents.filter(d => d.type === 'BUDGET'),
    INVOICE: documents.filter(d => d.type === 'INVOICE'),
    RECEIPT: documents.filter(d => d.type === 'RECEIPT'),
    PROJECT: documents.filter(d => d.type === 'PROJECT'),
    ATTACHMENT: documents.filter(d => d.type === 'ATTACHMENT'),
    TECHNICAL: documents.filter(d => d.type === 'TECHNICAL')
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'CONTRACT':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'BUDGET':
        return <ReceiptText className="w-5 h-5 text-green-600" />
      case 'INVOICE':
        return <FileCode className="w-5 h-5 text-purple-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CONTRACT: 'Contrato',
      BUDGET: 'Orçamento',
      INVOICE: 'Nota Fiscal',
      RECEIPT: 'Recibo',
      PROJECT: 'Projeto',
      ATTACHMENT: 'Anexo',
      TECHNICAL: 'Técnico'
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          </div>
          <p className="text-gray-600">
            Acesse contratos, orçamentos, notas fiscais e outros documentos
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Nenhum documento disponível</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="CONTRACT" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
              {Object.entries(documentsByType).map(([type, docs]) => (
                (docs.length > 0) && (
                  <TabsTrigger key={type} value={type} className="text-xs md:text-sm">
                    {getDocumentTypeLabel(type)} ({docs.length})
                  </TabsTrigger>
                )
              ))}
            </TabsList>

            {Object.entries(documentsByType).map(([type, docs]) => (
              docs.length > 0 && (
                <TabsContent key={type} value={type} className="space-y-4">
                  {docs.map(doc => (
                    <Card key={doc.id} className="hover:border-blue-300 transition">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-1">
                              {getDocumentIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {doc.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {(doc.fileSize / 1024).toFixed(0)} KB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Enviado em {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              asChild
                            >
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Visualizar</span>
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              asChild
                            >
                              <a href={doc.url} download>
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )
            ))}
          </Tabs>
        )}
      </main>
    </div>
  )
}
