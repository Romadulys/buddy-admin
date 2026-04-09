'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// ─── Navigation items ────────────────────────────────────────────────────────

const b2cMain = [
  { href: '/dashboard',     label: 'Dashboard',      icon: '📊' },
  { href: '/clients',       label: 'Clients',        icon: '👥' },
  { href: '/devices',       label: 'Appareils',      icon: '📱' },
  { href: '/subscriptions', label: 'Abonnements',    icon: '💳' },
  { href: '/commandes',     label: 'Précommandes',   icon: '🛒' },
  { href: '/referral',      label: 'Parrainage',     icon: '🎁' },
  { href: '/support',       label: 'Support',        icon: '🎧' },
]

const b2cContent = [
  { href: '/content/faq',     label: 'FAQ',          icon: '❓' },
  { href: '/content/reviews', label: 'Avis clients', icon: '⭐' },
  { href: '/content/coques',  label: 'Coques',       icon: '🎨' },
]

const b2bItems = [
  { href: '/b2b/pipeline',   label: 'Pipeline',          icon: '🎯' },
  { href: '/b2b/clients',    label: 'Clients B2B',       icon: '🏢' },
  { href: '/b2b/orders',     label: 'Commandes',         icon: '📦' },
  { href: '/b2b/deliveries', label: 'Livraisons',        icon: '🚚' },
  { href: '/b2b/stock',      label: 'Stock & Arrivages', icon: '🗃️' },
  { href: '/b2b/simulator',  label: 'Simulateur',        icon: '🧮' },
]

type Mode = 'b2c' | 'b2b'

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-5 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
      {label}
    </p>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [mode, setMode] = useState<Mode>('b2c')

  // Persist mode in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('buddy_sidebar_mode') as Mode | null
      if (saved === 'b2c' || saved === 'b2b') setMode(saved)
    } catch {}
  }, [])

  const switchMode = (m: Mode) => {
    setMode(m)
    try { localStorage.setItem('buddy_sidebar_mode', m) } catch {}
  }

  const handleSignOut = () => {
    setSigningOut(true)
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

      {/* Mode switcher */}
      <div className="px-4 pt-4">
        <div className="flex rounded-lg bg-white/5 p-1 gap-1">
          <button
            onClick={() => switchMode('b2c')}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              mode === 'b2c'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 B2C
          </button>
          <button
            onClick={() => switchMode('b2b')}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              mode === 'b2b'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏢 B2B
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">

        {mode === 'b2c' && (
          <>
            <SectionLabel label="Opérations" />
            <div className="space-y-0.5">
              {b2cMain.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            <div className="border-t border-white/10 mt-4" />

            <SectionLabel label="Contenu & SEO" />
            <div className="space-y-0.5">
              {b2cContent.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </>
        )}

        {mode === 'b2b' && (
          <>
            <SectionLabel label="Ventes & Distribution" />
            <div className="space-y-0.5">
              {b2bItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </>
        )}

      </nav>

      {/* Bottom */}
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
