'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProgressBar } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react'

interface LeadImportProps {
  onImport: (file: File, mapping: Record<string, string>) => Promise<void>
}

type ImportStep = 'upload' | 'preview' | 'mapping' | 'validation' | 'complete'

interface ImportResult {
  imported: number
  duplicates: number
  errors: number
  ignored: number
}

export function LeadImport({ onImport }: LeadImportProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(csv|xlsx)$/)) {
      setError('Apenas CSV ou Excel (.xlsx) são aceitos')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Simular leitura de arquivo
    try {
      // Em produção, usar biblioteca como 'papaparse' para CSV e 'xlsx' para Excel
      const mockPreview = [
        { name: 'João Silva', phone: '(11) 98765-4321', city: 'São Paulo', email: 'joao@example.com' },
        { name: 'Maria Santos', phone: '(11) 99876-5432', city: 'Campinas', email: 'maria@example.com' },
        { name: 'Pedro Costa', phone: '(21) 97654-3210', city: 'Rio de Janeiro', email: 'pedro@example.com' }
      ]
      setPreview(mockPreview)
      setStep('preview')
    } catch (err) {
      setError('Erro ao ler arquivo')
    }
  }

  const handleMapColumns = () => {
    setStep('mapping')
  }

  const handleValidation = async () => {
    if (!file) return

    setLoading(true)
    setStep('validation')

    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockResult: ImportResult = {
        imported: 98,
        duplicates: 2,
        errors: 0,
        ignored: 0
      }

      setResult(mockResult)
      setStep('complete')
    } catch (err) {
      setError('Erro ao importar leads')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'Nome,Telefone,Email,Cidade,Origem\nJoão Silva,(11) 98765-4321,joao@example.com,São Paulo,Site'
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template))
    element.setAttribute('download', 'template_leads.csv')
    element.click()
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex justify-between">
          {(['upload', 'preview', 'mapping', 'validation', 'complete'] as ImportStep[]).map((s, idx) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  ['upload', 'preview', 'mapping', 'validation', 'complete'].indexOf(step) >= idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs mt-1 capitalize">{s}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload de Arquivo</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Arraste um arquivo CSV ou Excel aqui</p>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="outline" as Const="label">
                  Selecionar Arquivo
                </Button>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm">{file.name}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={handleMapColumns} disabled={!file} className="flex-1">
                Próximo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {Object.keys(preview[0] || {}).map(key => (
                    <th key={key} className="text-left py-2 px-2">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b">
                    {Object.values(row).map((val: any, colIdx) => (
                      <td key={colIdx} className="py-2 px-2">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-2">Mostrando 5 primeiras linhas de {preview.length}</p>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
              Voltar
            </Button>
            <Button onClick={handleValidation} disabled={loading} className="flex-1">
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && result && (
        <Card className="p-6">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Importação Concluída!</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Importados</p>
              <p className="text-2xl font-bold text-green-600">{result.imported}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <p className="text-sm text-gray-600">Duplicados</p>
              <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <p className="text-sm text-gray-600">Erros</p>
              <p className="text-2xl font-bold text-red-600">{result.errors}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Ignorados</p>
              <p className="text-2xl font-bold text-gray-600">{result.ignored}</p>
            </div>
          </div>

          <Button onClick={() => setStep('upload')} className="w-full">
            Importar Novo Arquivo
          </Button>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
