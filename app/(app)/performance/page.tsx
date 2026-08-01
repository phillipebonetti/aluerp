'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Zap, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react'

interface PerformanceMetrics {
  lcp: number // Largest Contentful Paint
  inp: number // Interaction to Next Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
}

interface QueryMetrics {
  name: string
  averageTime: number
  maxTime: number
  minTime: number
  callCount: number
  lastCalled: Date
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    inp: 0,
    cls: 0,
    fid: 0,
    ttfb: 0,
    fcp: 0,
  })

  const [slowQueries, setSlowQueries] = useState<QueryMetrics[]>([])
  const [memoryUsage, setMemoryUsage] = useState({ current: 0, max: 0 })
  const [cacheStats, setCacheStats] = useState({ keys: 0, totalSize: 0 })

  useEffect(() => {
    // Coletar Web Vitals
    if ('web-vital' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'LCP') {
            setMetrics((prev) => ({ ...prev, lcp: entry.duration }))
          }
          if (entry.name === 'FCP') {
            setMetrics((prev) => ({ ...prev, fcp: entry.duration }))
          }
          if (entry.name === 'CLS') {
            setMetrics((prev) => ({ ...prev, cls: entry.duration }))
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] })
    }

    // Memory usage (se disponível)
    if ('memory' in performance) {
      const memPerf = (performance as any).memory
      setMemoryUsage({
        current: Math.round(memPerf.usedJSHeapSize / 1048576), // MB
        max: Math.round(memPerf.jsHeapSizeLimit / 1048576), // MB
      })
    }

    // Simular dados de queries lentas
    setSlowQueries([
      {
        name: 'listWorks',
        averageTime: 245,
        maxTime: 589,
        minTime: 123,
        callCount: 42,
        lastCalled: new Date(),
      },
      {
        name: 'listClients',
        averageTime: 156,
        maxTime: 456,
        minTime: 89,
        callCount: 67,
        lastCalled: new Date(),
      },
      {
        name: 'getPayments',
        averageTime: 312,
        maxTime: 723,
        minTime: 167,
        callCount: 34,
        lastCalled: new Date(),
      },
    ])

    // Cache stats
    setCacheStats({ keys: 34, totalSize: 2456 })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Performance</h1>
          <p className="text-gray-600">Análise de performance, Core Web Vitals e otimizações</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lcp.toFixed(0)}ms</div>
            <p className={`text-xs ${metrics.lcp < 2500 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.lcp < 2500 ? 'Bom' : 'Ruim'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">INP</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inp.toFixed(0)}ms</div>
            <p className={`text-xs ${metrics.inp < 200 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.inp < 200 ? 'Bom' : 'Ruim'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cls.toFixed(2)}</div>
            <p className={`text-xs ${metrics.cls < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.cls < 0.1 ? 'Bom' : 'Ruim'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="queries" className="w-full">
        <TabsList>
          <TabsTrigger value="queries">Queries Lentas</TabsTrigger>
          <TabsTrigger value="memory">Memória</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        {/* Queries Lentas */}
        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Queries Mais Lentas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slowQueries.map((query) => (
                  <div key={query.name} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{query.name}</h3>
                        <p className="text-sm text-gray-600">Chamadas: {query.callCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{query.averageTime}ms</p>
                        <p className="text-xs text-gray-600">
                          Min: {query.minTime}ms | Max: {query.maxTime}ms
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{
                          width: `${Math.min((query.averageTime / query.maxTime) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memória */}
        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Memória</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Heap em uso</span>
                    <span className="font-bold">{memoryUsage.current}MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-3">
                    <div
                      className="bg-green-600 h-3 rounded"
                      style={{
                        width: `${(memoryUsage.current / memoryUsage.max) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Máximo: {memoryUsage.max}MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache */}
        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Chaves em Cache</p>
                  <p className="text-2xl font-bold">{cacheStats.keys}</p>
                </div>
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Tamanho Total</p>
                  <p className="text-2xl font-bold">{(cacheStats.totalSize / 1024).toFixed(1)}KB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-sm">Implementar paginação em listWorks</p>
                  <p className="text-xs text-gray-600">Query levando 245ms em média</p>
                </li>
                <li className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-sm">Adicionar cache em getPayments</p>
                  <p className="text-xs text-gray-600">Chamada frequente (34 vezes), ótimo candidato para cache</p>
                </li>
                <li className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="font-semibold text-sm">Implementar virtualização na tabela de clientes</p>
                  <p className="text-xs text-gray-600">Renderizando muitos itens</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
