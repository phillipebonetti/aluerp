import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface ListItemProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  description?: string
  value?: string | ReactNode
  badge?: ReactNode
  action?: ReactNode
  onClick?: () => void
  className?: string
  showArrow?: boolean
  variant?: 'default' | 'muted' | 'highlight'
}

export function ListItem({
  icon: Icon,
  title,
  subtitle,
  description,
  value,
  badge,
  action,
  onClick,
  className,
  showArrow = false,
  variant = 'default',
}: ListItemProps) {
  const variantClasses = {
    default: 'hover:bg-muted/50',
    muted: 'bg-muted/30 hover:bg-muted/50',
    highlight: 'bg-accent/10 hover:bg-accent/20 border-l-2 border-accent',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border border-border transition-all duration-200',
        onClick && 'cursor-pointer',
        variantClasses[variant],
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        {description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>}
      </div>

      {value && <div className="text-sm font-semibold text-foreground flex-shrink-0 text-right">{value}</div>}

      {action && <div className="flex-shrink-0">{action}</div>}

      {showArrow && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
    </div>
  )
}
