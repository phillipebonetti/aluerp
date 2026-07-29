/**
 * UI Components Library
 * Componentes reutilizáveis padronizados para AluERP
 */

// Core
export { Button, buttonVariants } from './button'
export type { } from './button'

// Cards
export { DashboardCard } from './dashboard-card'
export { MoneyCard } from './money-card'
export { MetricCard } from './metric-card'
export { SectionCard } from './section-card'
export type { MoneyCardProps } from './money-card'
export type { MetricCardProps } from './metric-card'

// Data Display
export { DataTable } from './data-table'
export { DataTableAdvanced } from './data-table-advanced'
export { ListItem } from './list-item'
export { StatGroup } from './stat-group'
export type { DataTableProps } from './data-table'

// Form Components
export { FormInput } from './form-input'
export { FormTextarea } from './form-textarea'
export { FormSelect } from './form-select'
export { FormDatePicker } from './form-date-picker'
export { FormSection } from './form-section'

// Search & Filter
export { SearchBar } from './search-bar'
export { FilterBar } from './filter-bar'
export type { FilterItem } from './filter-bar'

// Chart & Analytics
export { DashboardChart } from './dashboard-chart'

// Layout
export { PageHeader } from './page-header'
export { Badge } from './badge'
export { Separator } from './separator'

// Dialogs & Modals
export { ConfirmDialog } from './confirm-dialog'
export { Modal } from './modal'
export { Drawer } from './drawer'

// States
export { EmptyState } from './empty-state'
export { Skeleton, DashboardSkeleton, TableSkeleton, LoadingCard } from './loading-state'

// Utilities
export { Avatar, AvatarImage, AvatarFallback } from './avatar'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
export { StatusBadge } from './status-badge'
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu'
export { Sheet, SheetTrigger, SheetContent } from './sheet'
