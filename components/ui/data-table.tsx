import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  label: string
  className?: string
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5 first:pl-5',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-b border-border/50 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/30'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-5 py-3 first:pl-5"
                >
                  {col.render
                    ? col.render(row[col.key as keyof T], row)
                    : <span className="text-xs text-foreground">{String(row[col.key as keyof T] ?? '')}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
