'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
