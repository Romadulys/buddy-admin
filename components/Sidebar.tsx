'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const mainItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/devices', label: 'Appareils', icon: '📱' },
  { href: '/subscriptions', label: 'Abonnements', icon: '💳' },
  { href: '/referral', label: 'Parrainage', icon: '🎁' },
  { href: '/support', label: 'Support', icon: '🎧' },
]

const commandesItems = [
  { href: '/commandes', label: 'Précommandes web', icon: '🛒' },
]

const b2bItems = [
  { href: '/b2b/clients', label: 'Clients B2B', icon: '🏢' },
  { href: '/b2b/orders', label: 'Commandes', icon: '📦' },
  { href: '/b2b/deliveries', label: 'Livraisons', icon: '🚚' },
  { href: '/b2b/stock', label: 'Stock & Arrivages', icon: '📊' },
  { href: '/b2b/simulator', label: 'Simulateur', icon: '🧮' },
]

const contentItems = [
  { href: '/content/faq', label: 'FAQ', icon: '❓' },
  { href: '/content/reviews', label: 'Avis clients', icon: '⭐' },
  { href: '/content/coques', label: 'Coques', icon: '🎨' },
]

type SectionKey = 'commandes' | 'b2b' | 'content'

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

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-0 py-1 group"
    >
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
        {label}
      </p>
      <span
        className={`text-slate-600 text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      >
        ▼
      </span>
    </button>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // Collapsible section states — persisted in localStorage
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    commandes: true,
    b2b: true,
    content: true,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('buddy_sidebar_open')
      if (saved) setOpen(JSON.parse(saved))
    } catch {}
  }, [])

  const toggle = (key: SectionKey) => {
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('buddy_sidebar_open', JSON.stringify(next)) } catch {}
      return next
    })
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {/* Main */}
        {mainItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* ── Précommandes ── */}
        <div className="pt-4 pb-1 px-3">
          <SectionHeader label="Précommandes" open={open.commandes} onToggle={() => toggle('commandes')} />
        </div>
        {open.commandes && (
          <div className="space-y-1">
            {commandesItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}

        {/* ── B2B & Distribution ── */}
        <div className="pt-4 pb-1 px-3">
          <div className="border-t border-white/10 pt-3">
            <SectionHeader label="B2B & Distribution" open={open.b2b} onToggle={() => toggle('b2b')} />
          </div>
        </div>
        {open.b2b && (
          <div className="space-y-1">
            {b2bItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}

        {/* ── Contenu & SEO ── */}
        <div className="pt-4 pb-1 px-3">
          <div className="border-t border-white/10 pt-3">
            <SectionHeader label="Contenu & SEO" open={open.content} onToggle={() => toggle('content')} />
          </div>
        </div>
        {open.content && (
          <div className="space-y-1">
            {contentItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
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
