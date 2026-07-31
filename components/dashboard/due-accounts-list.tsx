'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, getDueStatus, getStatusColor } from '@/src/utils/dashboard'

interface DueAccount {
  id: string
  name: string
  amount: number
  dueDate: Date | string
  type: 'receive' | 'pay'
}

interface DueAccountsListProps {
  accounts: DueAccount[]
  loading?: boolean
}

export function DueAccountsList({ accounts, loading }: DueAccountsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  const grouped = {
    overdue: accounts.filter(a => getDaysUntilDue(a.dueDate) < 0),
    today: accounts.filter(a => getDaysUntilDue(a.dueDate) === 0),
    tomorrow: accounts.filter(a => getDaysUntilDue(a.dueDate) === 1),
    week: accounts.filter(a => {
      const days = getDaysUntilDue(a.dueDate)
      return days > 1 && days <= 7
    }),
    month: accounts.filter(a => {
      const days = getDaysUntilDue(a.dueDate)
      return days > 7 && days <= 30
    })
  }

  const sections = [
    { key: 'overdue', label: 'Vencidas', color: 'text-red-600' },
    { key: 'today', label: 'Hoje', color: 'text-orange-600' },
    { key: 'tomorrow', label: 'Amanhã', color: 'text-yellow-600' },
    { key: 'week', label: 'Próximos 7 dias', color: 'text-blue-600' },
    { key: 'month', label: 'Até 30 dias', color: 'text-green-600' }
  ]

  return (
    <div className="space-y-4">
      {sections.map(section => {
        const items = (grouped as any)[section.key]
        if (items.length === 0) return null

        return (
          <div key={section.key}>
            <h4 className={cn('text-sm font-semibold mb-2', section.color)}>
              {section.label} ({items.length})
            </h4>
            <div className="space-y-2">
              {items.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {account.type === 'receive' ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{account.name}</p>
                      <p className="text-xs text-gray-600">{formatDate(account.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(account.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { cn } from '@/lib/utils'
