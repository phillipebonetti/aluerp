import { cn } from '@/lib/utils'
import { Button } from './button'
import { LucideIcon, Plus } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  action?: {
    label: string
    icon?: LucideIcon
  }
  badge?: string
  className?: string
}

export function PageHeader({ title, description, action, badge, className }: PageHeaderProps) {
  const ActionIcon = action?.icon ?? Plus

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-foreground text-balance">{title}</h1>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 text-pretty leading-relaxed">{description}</p>
      </div>
      {action && (
        <Button size="sm" className="h-8 text-xs font-medium shrink-0">
          <ActionIcon className="w-3.5 h-3.5" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
