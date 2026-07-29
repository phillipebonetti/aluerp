import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface DrawerProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  position?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Drawer({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  position = 'right',
  size = 'md',
  className,
}: DrawerProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-96',
    lg: 'w-[28rem]',
  }

  const positionClass = position === 'left' ? 'left-0' : 'right-0'

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 h-screen bg-card border border-border shadow-lg overflow-hidden flex flex-col z-50 animate-in slide-in',
          sizeClasses[size],
          positionClass,
          position === 'left' ? 'slide-in-from-left' : 'slide-in-from-right',
          className
        )}
      >
        <div className="border-b border-border px-6 py-4 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="flex-shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="border-t border-border px-6 py-4 bg-muted/30 flex-shrink-0">{footer}</div>}
      </div>
    </>
  )
}
