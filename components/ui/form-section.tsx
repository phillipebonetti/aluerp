import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  columnLayout?: 1 | 2 | 3
}

export function FormSection({
  title,
  description,
  children,
  className,
  columnLayout = 1,
}: FormSectionProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className={cn('grid gap-4', gridClass[columnLayout])}>{children}</div>
    </div>
  )
}
