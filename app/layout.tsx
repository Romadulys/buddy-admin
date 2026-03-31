import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

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
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-full overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
