'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface PlatformConnection {
  platform: string
  enabled: boolean
  connected: boolean
}

type Period = '7j' | '30j' | '90j'

export default function SearchConsolePage() {
  const [gscPlatform, setGscPlatform] = useState<PlatformConnection | null>(null)
  const [loadingPlatform, setLoadingPlatform] = useState(true)
  const [period, setPeriod] = useState<Period>('30j')

  const fetchPlatforms = useCallback(async () => {
    setLoadingPlatform(true)
    try {
      const res = await fetch('/api/marketing/platforms')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      const platforms: PlatformConnection[] = data.platforms ?? data ?? []
      const gsc = platforms.find((p) => p.platform === 'google_search_console') ?? null
      setGscPlatform(gsc)
    } catch {
      setGscPlatform(null)
    } finally {
      setLoadingPlatform(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatforms()
  }, [fetchPlatforms])

  const isConnected = gscPlatform?.enabled && gscPlatform?.connected

  if (loadingPlatform) {
    return (
      <div className="p-6 anim-section flex items-center justify-center h-64 text-slate-400">
        Chargement...
      </div>
    )
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search Console</h1>
        <p className="text-sm text-slate-500 mt-1">
          Performances organiques de votre site via Google Search Console
        </p>
      </div>

      {!isConnected ? (
        /* Not connected — CTA */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
            G
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Connectez Google Search Console
            </h2>
            <p className="text-sm text-slate-500 max-w-md">
              Reliez votre compte Search Console pour visualiser les impressions, clics, et positions de vos pages dans les resultats Google.
            </p>
          </div>
          <Link
            href="/marketing/platforms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Connecter Google Search Console
          </Link>
          <p className="text-xs text-slate-400">
            Vous serez redirige vers la page de connexion des plateformes.
          </p>
        </div>
      ) : (
        /* Connected — placeholder dashboard */
        <div className="space-y-6">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            {(['7j', '30j', '90j'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Impressions', value: '--' },
              { label: 'Clics', value: '--' },
              { label: 'CTR moyen', value: '--' },
              { label: 'Position moyenne', value: '--' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs uppercase font-medium text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-400">{value}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Donnees disponibles apres connexion
                </p>
              </div>
            ))}
          </div>

          {/* Placeholder chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Graphique d'evolution</h2>
            <div className="h-48 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
              <span className="text-3xl">TS</span>
              <span className="text-sm">Graphique disponible apres connexion</span>
            </div>
          </div>

          {/* Top pages placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Meilleures pages</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Page', 'Impressions', 'Clics', 'CTR', 'Position'].map((col) => (
                    <th key={col} className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Les donnees seront disponibles apres connexion a Search Console.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top requetes placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Meilleures requetes</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Requete', 'Impressions', 'Clics', 'CTR', 'Position'].map((col) => (
                    <th key={col} className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Les donnees seront disponibles apres connexion a Search Console.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Info notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-700">
            Les donnees seront synchronisees automatiquement une fois Search Console connecte.
          </div>
        </div>
      )}
    </div>
  )
}
