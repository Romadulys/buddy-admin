'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function SidebarWrapper() {
  const pathname = usePathname()
  const hideSidebar = pathname === '/login'
  if (hideSidebar) return null
  return <Sidebar />
}
