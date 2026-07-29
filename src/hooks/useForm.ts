import { useCallback, useState, useTransition } from 'react'
import { UseFormReturn, useForm as useHookForm, FieldValues, DefaultValues, ResolverOptions, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'

interface UseFormProps<T extends FieldValues = any> {
  schema: ZodSchema
  defaultValues?: DefaultValues<T>
  onSubmit: (data: T) => Promise<{ success?: boolean; error?: string; data?: any }>
}

interface UseFormReturn<T extends FieldValues = any> extends UseFormReturn<T> {
  isPending: boolean
  submitError: string | null
  isSubmitting: boolean
  handleSubmit: (onValid: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>
}

/**
 * Hook customizado que combina React Hook Form + Zod
 * Fornece validação automática, loading e error handling
 */
export function useStandardForm<T extends FieldValues = any>({
  schema,
  defaultValues,
  onSubmit,
}: UseFormProps<T>): UseFormReturn<T> {
  const [isPending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useHookForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const handleFormSubmit = useCallback(
    (onValid: SubmitHandler<T>) => async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault()
      setSubmitError(null)

      // Validar antes de submeter
      const isValid = await form.trigger()
      if (!isValid) return

      startTransition(async () => {
        try {
          const data = form.getValues()
          const result = await onSubmit(data)

          if (result.error) {
            setSubmitError(result.error)
          } else if (result.success) {
            form.reset()
          }
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : 'Erro ao processar formulário')
        }
      })
    },
    [form, onSubmit]
  )

  return {
    ...form,
    handleSubmit: handleFormSubmit,
    isPending,
    submitError,
    isSubmitting: isPending,
  } as UseFormReturn<T>
}

/**
 * Hook para gerenciar estados comuns de formulário
 */
export function useFormState(initialError?: string) {
  const [error, setError] = useState<string | null>(initialError || null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const clearError = useCallback(() => setError(null), [])
  const clearSuccess = useCallback(() => setSuccess(false), [])
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    error,
    setError,
    clearError,
    success,
    setSuccess,
    clearSuccess,
    reset,
    isPending,
    startTransition,
  }
}

/**
 * Hook para gerenciar campo com máscara
 */
export function useMaskedInput(mask: (value: string) => string) {
  const [value, setValue] = useState('')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = mask(e.target.value)
    setValue(masked)
    e.target.value = masked
  }, [mask])

  return { value, setValue, handleChange }
}
