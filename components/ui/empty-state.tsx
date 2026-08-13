import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground text-balance">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs text-balance leading-relaxed">{description}</p>
      {action && (
        action.href ? (
          <Button asChild size="sm" className="mt-5 h-8 text-xs font-medium"><Link href={action.href}>{action.label}</Link></Button>
        ) : (
          <Button onClick={action.onClick} size="sm" className="mt-5 h-8 text-xs font-medium">{action.label}</Button>
        )
      )}
    </div>
  )
}
