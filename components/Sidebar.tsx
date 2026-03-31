'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/devices', label: 'Appareils', icon: '📱' },
  { href: '/subscriptions', label: 'Abonnements', icon: '💳' },
  { href: '/referral', label: 'Parrainage', icon: '🎁' },
  { href: '/support', label: 'Support', icon: '🎧' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    // Clear admin session cookie
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-white flex flex-col z-50 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-lg font-bold shadow">
          B
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Buddy Admin</p>
          <p className="text-[10px] text-slate-400 leading-tight">GPS Tracker Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm">
            👤
          </div>
          <div>
            <p className="text-xs font-medium text-white">Administrateur</p>
            <p className="text-[10px] text-slate-400">Buddy Team</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-150 disabled:opacity-50"
        >
          <span>🚪</span>
          {signingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </aside>
  )
}
