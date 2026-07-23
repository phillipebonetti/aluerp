'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Banknote,
  HardHat,
  Users,
  Truck,
  FileText,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Financeiro', href: '/financeiro', icon: Banknote },
  { label: 'Obras', href: '/obras', icon: HardHat },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Fornecedores', href: '/fornecedores', icon: Truck },
  { label: 'Orçamentos', href: '/orcamentos', icon: FileText },
  { label: 'Ordens de Serviço', href: '/os', icon: ClipboardList },
  { label: 'Agenda', href: '/agenda', icon: CalendarDays },
  { label: 'Relatórios', href: '/relatorios', icon: BarChart3 },
]

const bottomItems = [
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: { label: string; href: string; icon: React.ElementType }
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              className={cn(
                'flex items-center justify-center h-9 w-full rounded-md transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
            </Link>
          }
        />
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 h-9 px-3 rounded-md text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-sidebar-border px-4 shrink-0',
        collapsed ? 'justify-center px-0' : 'gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent shrink-0">
          <Layers className="w-4 h-4 text-accent-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">AluERP</span>
            <span className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">Pro</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-sidebar-border px-2 py-3 flex flex-col gap-0.5">
        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[52px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150 shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
