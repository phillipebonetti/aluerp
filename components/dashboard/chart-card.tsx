'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  onExport?: (format: 'png' | 'svg') => void
  onDownload?: () => void
  isLoading?: boolean
  className?: string
  footer?: React.ReactNode
}

export const ChartCard = React.memo(function ChartCard({
  title,
  description,
  children,
  onExport,
  onDownload,
  isLoading,
  className,
  footer,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('png')}>
                  Exportar como PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('svg')}>
                  Exportar como SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        ) : (
          <>
            <div className="h-80">{children}</div>
            {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
})

ChartCard.displayName = 'ChartCard'
