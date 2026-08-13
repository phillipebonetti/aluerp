'use client'

import { Search, Sun, Moon, ChevronDown, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { logoutAction } from '@/src/modules/auth/actions'
import type { SessionUser, SessionCompany } from '@/src/core/auth'

interface HeaderProps {
  onMenuClick?: () => void
  user?: SessionUser | null
  company?: SessionCompany | null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function Header({ onMenuClick, user, company }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const displayName = user?.name ?? 'Usuário'
  const displayEmail = user?.email ?? ''
  const displayCompany = company?.name ?? 'Minha Empresa'
  const initials = getInitials(displayName)

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0 sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        onClick={onMenuClick}
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar em todo o sistema..."
          className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/50 font-mono pointer-events-none">
          <span>⌘</span><span>K</span>
        </kbd>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        {user && (
          <NotificationBell userId={user.id} companyId={user.companyId} />
        )}

        {/* Separator */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/60 transition-colors h-8">
                <Avatar className="h-6 w-6">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                  <AvatarFallback className="text-[10px] font-semibold bg-accent text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-medium text-foreground">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground">{displayCompany}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground font-normal">{displayEmail}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sm">Meu Perfil</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Configurações</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Plano e Faturamento</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="text-sm"
                onClick={handleLogout}
                disabled={isPending}
              >
                {isPending ? 'Saindo...' : 'Sair'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
