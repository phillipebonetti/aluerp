import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  required?: boolean
  maxLength?: number
  showCount?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, helper, required, id, maxLength, showCount = true, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random()}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          className={cn(
            'w-full px-3 py-2 bg-input border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none',
            error && 'border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          <div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {helper && !error && <p className="text-xs text-muted-foreground">{helper}</p>}
          </div>
          {maxLength && showCount && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {(props.value as string)?.length || 0}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
