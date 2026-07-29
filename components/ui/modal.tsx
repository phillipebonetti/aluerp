import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeButton?: boolean
  className?: string
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
  closeButton = true,
  className,
}: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full px-4 animate-in fade-in zoom-in">
        <div className={cn('bg-card border border-border rounded-xl shadow-lg overflow-hidden', sizeClasses[size], className)}>
          <div className="border-b border-border px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
            {closeButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="px-6 py-4">{children}</div>
          {footer && <div className="border-t border-border px-6 py-4 bg-muted/30">{footer}</div>}
        </div>
      </div>
    </>
  )
}
