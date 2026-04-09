'use client'

import { useState, useEffect, useCallback } from 'react'

type Period = '7j' | '30j' | '90j'

const SOURCE_ROWS = [
  { source: 'Organic', sessions: '--', pct: '--', conversions: '--' },
  { source: 'Direct', sessions: '--', pct: '--', conversions: '--' },
  { source: 'Social', sessions: '--', pct: '--', conversions: '--' },
  { source: 'Paid', sessions: '--', pct: '--', conversions: '--' },
  { source: 'Referral', sessions: '--', pct: '--', conversions: '--' },
  { source: 'Email', sessions: '--', pct: '--', conversions: '--' },
]

const DEVICE_CARDS = [
  { label: 'Mobile', icon: '📱', sessions: '--', pct: '--', color: 'bg-blue-50 border-blue-200' },
  { label: 'Desktop', icon: '🖥️', sessions: '--', pct: '--', color: 'bg-green-50 border-green-200' },
  { label: 'Tablet', icon: '📟', sessions: '--', pct: '--', color: 'bg-purple-50 border-purple-200' },
]

const PAGE_ROWS = [
  { url: '/accueil', views: '--', avgTime: '--', bounce: '--' },
  { url: '/produits', views: '--', avgTime: '--', bounce: '--' },
  { url: '/blog', views: '--', avgTime: '--', bounce: '--' },
  { url: '/contact', views: '--', avgTime: '--', bounce: '--' },
]

export default function TrafficPage() {
  const [period, setPeriod] = useState<Period>('30j')
  const [gaConnected, setGaConnected] = useState<boolean | null>(null)

  const checkPlatforms = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/platforms')
      if (!res.ok) return
      const data = await res.json()
      const platforms: { platform: string; status?: string }[] = data.platforms ?? data ?? []
      const ga = platforms.find((p) => p.platform === 'google_analytics')
      setGaConnected(ga ? (ga.status === 'active' || ga.status === 'connected') : false)
    } catch {
      setGaConnected(false)
    }
  }, [])

  useEffect(() => {
    checkPlatforms()
  }, [checkPlatforms])

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🌐 Trafic</h1>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['7j', '30j', '90j'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Connection notice */}
      {gaConnected === false && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          Donnees disponibles apres connexion GA4 —{' '}
          <a href="/marketing/platforms" className="underline font-medium">
            Connecter Google Analytics
          </a>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sessions', value: '--' },
          { label: 'Pages vues', value: '--' },
          { label: 'Taux de rebond', value: '--' },
          { label: 'Duree moyenne', value: '--' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-slate-400">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* By source */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Par source</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-6 text-slate-500 font-medium">Source</th>
                <th className="text-right py-2 px-4 text-slate-500 font-medium">Sessions</th>
                <th className="text-right py-2 px-4 text-slate-500 font-medium">%</th>
                <th className="text-right py-2 pl-4 text-slate-500 font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {SOURCE_ROWS.map((row) => (
                <tr key={row.source} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-6 font-medium text-slate-700">{row.source}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{row.sessions}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{row.pct}</td>
                  <td className="py-2.5 pl-4 text-right text-slate-400">{row.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By device */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Par appareil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEVICE_CARDS.map((d) => (
            <div key={d.label} className={`rounded-lg border p-4 ${d.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{d.icon}</span>
                <span className="font-medium text-slate-700">{d.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-400">{d.sessions}</p>
              <p className="text-xs text-slate-400 mt-0.5">sessions — {d.pct}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By page */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Par page</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-6 text-slate-500 font-medium">Page</th>
                <th className="text-right py-2 px-4 text-slate-500 font-medium">Vues</th>
                <th className="text-right py-2 px-4 text-slate-500 font-medium">Temps moyen</th>
                <th className="text-right py-2 pl-4 text-slate-500 font-medium">Taux de rebond</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_ROWS.map((row) => (
                <tr key={row.url} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-6 font-mono text-slate-700 text-xs">{row.url}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{row.views}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">{row.avgTime}</td>
                  <td className="py-2.5 pl-4 text-right text-slate-400">{row.bounce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
