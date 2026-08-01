'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { calculateForecast } from '@/app/actions/cash-flow'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// TODO: Get from auth context
const companyId = 'test-company-id'
const accountId = 'test-account-id' // Should be selected by user

const FORECAST_PERIODS = [
  { label: '7 dias', days: 7 },
  { label: '15 dias', days: 15 },
  { label: '30 dias', days: 30 },
  { label: '60 dias', days: 60 },
  { label: '90 dias', days: 90 },
]

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  async function loadForecasts() {
    try {
      setIsLoading(true)

      const results = await Promise.all(
        FORECAST_PERIODS.map((period) => calculateForecast(companyId, accountId, period.days))
      )

      setForecasts(
        results.map((result, index) => ({
          period: FORECAST_PERIODS[index],
          ...result,
        }))
      )

      // Prepare chart data
      const data = results.map((result, index) => ({
        label: FORECAST_PERIODS[index].label,
        balance: result.projectedBalance,
        inflow: result.projectedInflow,
        outflow: result.projectedOutflow,
      }))

      setChartData(data)
    } catch (error) {
      console.error('Error loading forecasts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadForecasts()
  }, [])

  if (isLoading) {
    return <div className="p-6 text-center">Carregando previsões...</div>
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader title="Previsão de Fluxo de Caixa" description="Projeção de saldo para os próximos 90 dias" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {forecasts.map((forecast, index) => (
          <Card key={index} className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{forecast.period.label}</p>
            <p className="text-2xl font-bold mt-2">
              R$ {forecast.projectedBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <div className="text-xs text-muted-foreground mt-4 space-y-1">
              <p>
                Entrada: +R${' '}
                {forecast.projectedInflow.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p>
                Saída: -R${' '}
                {forecast.projectedOutflow.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução do Saldo Previsto</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Saldo Projetado" />
            <Line type="monotone" dataKey="inflow" stroke="#10b981" name="Entradas" />
            <Line type="monotone" dataKey="outflow" stroke="#ef4444" name="Saídas" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
