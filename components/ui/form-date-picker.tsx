import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'

interface FormDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helper?: string
  required?: boolean
}

export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  ({ className, label, error, helper, required, id, ...props }, ref) => {
    const dateId = id || `date-${Math.random()}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={dateId} className="text-xs font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={ref}
            type="date"
            id={dateId}
            className={cn(
              'w-full h-8 px-3 pl-9 bg-input border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-destructive focus:ring-destructive/20',
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

FormDatePicker.displayName = 'FormDatePicker'
