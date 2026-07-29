import { cn } from '@/lib/utils'

interface LoadingCardProps {
  lines?: number
  className?: string
  height?: 'sm' | 'md' | 'lg'
}

export function LoadingCard({ lines = 3, className, height = 'md' }: LoadingCardProps) {
  const heightClass = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48',
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-4 space-y-3', className)}>
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            {i === 0 && <div className="h-3 bg-muted rounded animate-pulse w-2/3" />}
          </div>
        ))}
      </div>
      <div className={cn('bg-muted rounded animate-pulse', heightClass[height])} />
    </div>
  )
}
