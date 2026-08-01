'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/src/lib/utils'
import { AlertCircle, Trophy, TrendingUp } from 'lucide-react'

// TODO: Get from auth context
const companyId = 'test-company-id'

interface GoalItem {
  employeeId: string
  employeeName: string
  goalTarget: number
  achievedRevenue: number
  percentage: number
  remaining: number
  ordersCount: number
  status: string
}

export default function MetasPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Load from server actions
    setIsLoading(false)

    // Mock data
    setGoals([
      {
        employeeId: '1',
        employeeName: 'João Silva',
        goalTarget: 50000,
        achievedRevenue: 45000,
        percentage: 90,
        remaining: 5000,
        ordersCount: 8,
        status: 'IN_PROGRESS',
      },
      {
        employeeId: '2',
        employeeName: 'Maria Santos',
        goalTarget: 50000,
        achievedRevenue: 58000,
        percentage: 116,
        remaining: 0,
        ordersCount: 10,
        status: 'ACHIEVED',
      },
      {
        employeeId: '3',
        employeeName: 'Pedro Oliveira',
        goalTarget: 40000,
        achievedRevenue: 28000,
        percentage: 70,
        remaining: 12000,
        ordersCount: 6,
        status: 'AT_RISK',
      },
      {
        employeeId: '4',
        employeeName: 'Ana Costa',
        goalTarget: 45000,
        achievedRevenue: 55000,
        percentage: 122,
        remaining: 0,
        ordersCount: 11,
        status: 'ACHIEVED',
      },
    ])
  }, [year, month])

  const achievedCount = goals.filter((g) => g.percentage >= 100).length
  const atRiskCount = goals.filter((g) => g.percentage < 70).length
  const avgPercentage = goals.length > 0 ? goals.reduce((sum, g) => sum + g.percentage, 0) / goals.length : 0
  const totalGoal = goals.reduce((sum, g) => sum + g.goalTarget, 0)
  const totalAchieved = goals.reduce((sum, g) => sum + g.achievedRevenue, 0)

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Metas de Vendas"
        description="Acompanhe o progresso das metas da equipe de vendedores"
      />

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <SelectItem key={m} value={String(m)}>
                {new Date(year, m - 1).toLocaleString('pt-BR', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalGoal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAchieved)}</p>
            <p className="text-xs text-muted-foreground">
              {((totalAchieved / totalGoal) * 100).toFixed(0)}% da meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Acima da Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{achievedCount}</p>
            <p className="text-xs text-muted-foreground">vendedores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Em Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{atRiskCount}</p>
            <p className="text-xs text-muted-foreground">vendedores</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.employeeId}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{goal.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{goal.ordersCount} pedidos</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">{goal.percentage.toFixed(0)}%</p>
                    <Badge
                      className={
                        goal.percentage >= 100
                          ? 'bg-green-100 text-green-800'
                          : goal.percentage >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {goal.percentage >= 100 ? 'Atingida' : goal.percentage >= 70 ? 'Em Progresso' : 'Em Risco'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta: {formatCurrency(goal.goalTarget)}</span>
                    <span>Realizado: {formatCurrency(goal.achievedRevenue)}</span>
                  </div>
                  <Progress value={Math.min(goal.percentage, 100)} className="h-2" />
                </div>

                {goal.remaining > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Faltam {formatCurrency(goal.remaining)} para atingir a meta
                  </p>
                )}

                {goal.percentage > 100 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Acima da meta em {formatCurrency(goal.achievedRevenue - goal.goalTarget)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
