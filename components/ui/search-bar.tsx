'use client'

import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { InputHTMLAttributes, useRef, useEffect } from 'react'

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string
  onClear?: () => void
  containerClassName?: string
  loading?: boolean
}

export function SearchBar({
  value,
  onClear,
  className,
  containerClassName,
  loading = false,
  ...props
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className={cn('relative w-full', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        className={cn(
          'w-full h-8 pl-9 pr-8 bg-input border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed',
          loading && 'opacity-50',
          className
        )}
        {...props}
      />
      {value && onClear && !loading && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )
}
