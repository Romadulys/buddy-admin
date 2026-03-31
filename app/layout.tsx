import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

export const metadata: Metadata = {
  title: 'Buddy Admin — GPS Tracker Dashboard',
  description: 'Admin dashboard for Buddy GPS tracker product',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-slate-50 antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
