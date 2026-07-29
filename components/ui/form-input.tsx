import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  helper?: string
  required?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, icon: Icon, helper, required, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-8 px-3 bg-input border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-destructive focus:ring-destructive/20',
              Icon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {helper && !error && <p className="text-xs text-muted-foreground">{helper}</p>}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
