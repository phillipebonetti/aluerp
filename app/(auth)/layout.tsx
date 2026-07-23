import { Layers } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <Layers className="w-4 h-4 text-accent-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-foreground tracking-tight">AluERP</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Pro</span>
          </div>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-center px-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AluERP. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
