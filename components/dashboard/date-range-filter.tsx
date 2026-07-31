'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface DateRange {
  from: Date
  to: Date
  preset?: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom'
}

interface DateRangeFilterProps {
  value?: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
}

const presets = [
  { label: 'Hoje', key: 'today', getValue: () => ({ from: new Date(), to: new Date(), preset: 'today' as const }) },
  { label: 'Ontem', key: 'yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1), preset: 'yesterday' as const }) },
  { label: 'Últimos 7 dias', key: '7days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date(), preset: '7days' as const }) },
  { label: 'Últimos 30 dias', key: '30days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date(), preset: '30days' as const }) },
  { label: 'Este mês', key: 'thisMonth', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()), preset: 'thisMonth' as const }) },
  { label: 'Mês anterior', key: 'lastMonth', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)), preset: 'lastMonth' as const }) },
  { label: 'Este ano', key: 'thisYear', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()), preset: 'thisYear' as const }) },
  { label: 'Ano anterior', key: 'lastYear', getValue: () => ({ from: startOfYear(subMonths(new Date(), 12)), to: endOfYear(subMonths(new Date(), 12)), preset: 'lastYear' as const }) },
]

export const DateRangeFilter = React.memo(function DateRangeFilter({
  value,
  onChange,
  placeholder = 'Selecionar período',
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState<Date | undefined>(value?.from)
  const [customTo, setCustomTo] = useState<Date | undefined>(value?.to)

  const handlePreset = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    onChange(range)
    setOpen(false)
  }

  const handleCustom = () => {
    if (customFrom && customTo) {
      onChange({
        from: customFrom,
        to: customTo,
        preset: 'custom',
      })
      setOpen(false)
    }
  }

  const displayText = value
    ? `${format(value.from, 'dd MMM', { locale: ptBR })} - ${format(value.to, 'dd MMM yyyy', { locale: ptBR })}`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Períodos predefinidos</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.key}
                  variant={value?.preset === preset.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePreset(preset)}
                  className="justify-start"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-2">Período personalizado</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">De</label>
                <input
                  type="date"
                  value={customFrom ? format(customFrom, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setCustomFrom(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Até</label>
                <input
                  type="date"
                  value={customTo ? format(customTo, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setCustomTo(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <Button
                onClick={handleCustom}
                disabled={!customFrom || !customTo}
                className="w-full"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

DateRangeFilter.displayName = 'DateRangeFilter'
