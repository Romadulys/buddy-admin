'use client'

import { useEffect, useState } from 'react'

export default function DashboardAnimated({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'splash' | 'reveal' | 'done'>('splash')

  useEffect(() => {
    // Splash → révéler après 900ms
    const t1 = setTimeout(() => setPhase('reveal'), 900)
    // Enlever l'overlay après la transition
    const t2 = setTimeout(() => setPhase('done'), 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative">
      {/* Splash overlay */}
      {phase !== 'done' && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a]"
          style={{
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            opacity: phase === 'reveal' ? 0 : 1,
            pointerEvents: phase === 'reveal' ? 'none' : 'all',
          }}
        >
          {/* Cercles lumineux */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

          {/* Logo animé */}
          <div
            className="relative flex flex-col items-center gap-4"
            style={{
              animation: 'splashIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-600/50 flex items-center justify-center text-4xl">
              📍
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">Buddy Admin</h1>
              <p className="text-indigo-300 text-sm mt-1 font-medium">Chargement du dashboard…</p>
            </div>

            {/* Barre de chargement */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-indigo-400 rounded-full"
                style={{ animation: 'loadBar 0.8s ease forwards' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenu du dashboard avec animation staggerée */}
      <div
        style={{
          opacity: phase === 'splash' ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        {children}
      </div>
    </div>
  )
}
