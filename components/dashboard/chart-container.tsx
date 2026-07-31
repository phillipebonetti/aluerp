'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  loading?: boolean
  footer?: React.ReactNode
}

export function ChartContainer({
  title,
  description,
  children,
  loading = false,
  footer
}: ChartContainerProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            {children}
            {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
