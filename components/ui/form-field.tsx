import { FC, ReactNode } from 'react'
import { FieldError } from 'react-hook-form'

interface FormFieldProps {
  label: string
  error?: FieldError
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
}

/**
 * Wrapper de campo de formulário com label, erro e hint
 */
export const FormField: FC<FormFieldProps> = ({
  label,
  error,
  required,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-xs text-destructive font-medium">{error.message}</p>
      )}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/**
 * Wrapper de seção de form com heading
 */
interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export const FormSectionGroup: FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

/**
 * Container para botões de ação de formulário
 */
interface FormActionsProps {
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  isValid?: boolean
  children?: ReactNode
}

export const FormActions: FC<FormActionsProps> = ({
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  isValid = true,
  children,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
      {children || (
        <>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : submitLabel}
          </button>
        </>
      )}
    </div>
  )
}
