import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'

const geistSans = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal do Cliente - AluERP',
  description: 'Acompanhe suas obras em tempo real',
  viewport: { width: 'device-width', initialScale: 1, userScalable: false }
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${geistSans.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
