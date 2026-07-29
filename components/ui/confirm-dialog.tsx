import { cn } from '@/lib/utils'
import { Button } from './button'
import { ReactNode } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  icon?: ReactNode
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  icon,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-in fade-in zoom-in">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-start gap-4">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              {description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="text-xs font-medium"
            >
              {cancelText}
            </Button>
            <Button
              variant={isDangerous ? 'destructive' : 'default'}
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
              className="text-xs font-medium"
            >
              {isLoading ? 'Processando...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
