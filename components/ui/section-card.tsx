import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionCardProps {
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  headerClassName?: string
}

export function SectionCard({
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
}: SectionCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {(title || description) && (
        <div className={cn('border-b border-border px-5 py-4', headerClassName)}>
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-border px-5 py-3 bg-muted/30">{footer}</div>}
    </div>
  )
}
