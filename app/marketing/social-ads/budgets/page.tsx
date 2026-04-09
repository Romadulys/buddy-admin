'use client'

import { useState, useEffect, useCallback } from 'react'

interface BudgetLimits {
  daily_limit: number | null
  weekly_limit: number | null
  monthly_limit: number | null
  alert_thresholds: number[]
  auto_pause: boolean
}

const ALERT_THRESHOLDS = [
  { pct: 70, label: '70%', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { pct: 90, label: '90%', style: 'bg-orange-100 text-orange-700 border-orange-200' },
  { pct: 100, label: '100%', style: 'bg-red-100 text-red-700 border-red-200' },
]

const EMPTY_LIMITS: BudgetLimits = {
  daily_limit: null,
  weekly_limit: null,
  monthly_limit: null,
  alert_thresholds: [70, 90, 100],
  auto_pause: true,
}

function BudgetSection({
  title,
  icon,
  scope,
  limits,
  setLimits,
}: {
  title: string
  icon: string
  scope: string
  limits: BudgetLimits
  setLimits: (v: BudgetLimits) => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/marketing/sea/budgets/limits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, ...limits }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl">{icon}</span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2.5 py-1 rounded-full">{scope}</span>
      </div>

      <form onSubmit={handleSave}>
        {/* Limit inputs */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Limite jour (€)</label>
            <input
              type="number"
              value={limits.daily_limit ?? ''}
              onChange={(e) => setLimits({ ...limits, daily_limit: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="ex: 50"
              min="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Limite semaine (€)</label>
            <input
              type="number"
              value={limits.weekly_limit ?? ''}
              onChange={(e) => setLimits({ ...limits, weekly_limit: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="ex: 300"
              min="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Limite mois (€)</label>
            <input
              type="number"
              value={limits.monthly_limit ?? ''}
              onChange={(e) => setLimits({ ...limits, monthly_limit: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="ex: 1000"
              min="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Alert thresholds */}
        <div className="mb-5">
          <p className="text-xs font-medium text-slate-600 mb-2">Alertes automatiques</p>
          <div className="flex gap-2">
            {ALERT_THRESHOLDS.map((t) => (
              <span key={t.pct} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${t.style}`}>
                ⚡ {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Auto-pause toggle */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setLimits({ ...limits, auto_pause: !limits.auto_pause })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${limits.auto_pause ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${limits.auto_pause ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-slate-700">Pause automatique a 100% du budget</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Enregistrement...' : saved ? '✓ Enregistre' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}

export default function SocialAdsBudgetsPage() {
  const [metaLimits, setMetaLimits] = useState<BudgetLimits>(EMPTY_LIMITS)
  const [tiktokLimits, setTiktokLimits] = useState<BudgetLimits>(EMPTY_LIMITS)
  const [globalLimits, setGlobalLimits] = useState<BudgetLimits>(EMPTY_LIMITS)
  const [loading, setLoading] = useState(true)

  const fetchLimits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/sea/budgets/limits')
      if (!res.ok) return
      const data = await res.json()
      const rows: Array<{ scope: string } & BudgetLimits> = Array.isArray(data) ? data : [data]

      const findScope = (scope: string): BudgetLimits => {
        const row = rows.find((r) => r.scope === scope)
        if (!row) return EMPTY_LIMITS
        return {
          daily_limit:      row.daily_limit ?? null,
          weekly_limit:     row.weekly_limit ?? null,
          monthly_limit:    row.monthly_limit ?? null,
          alert_thresholds: row.alert_thresholds ?? [70, 90, 100],
          auto_pause:       row.auto_pause ?? true,
        }
      }

      setMetaLimits(findScope('meta_ads'))
      setTiktokLimits(findScope('tiktok_ads'))
      setGlobalLimits(findScope('global'))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLimits() }, [fetchLimits])

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">💵 Limites Budget Social Ads</h1>
        {/* Safety banner */}
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 w-fit">
          <span>🛡️</span>
          <span className="font-semibold">Le plafond le plus restrictif gagne toujours</span>
          <span className="text-red-600">— Si global = 500€/mois, aucune plateforme ne peut depenser plus, meme si son plafond individuel est plus haut.</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Meta section */}
          <BudgetSection
            title="Limites Meta Ads"
            icon="📢"
            scope="meta_ads"
            limits={metaLimits}
            setLimits={setMetaLimits}
          />

          {/* TikTok section */}
          <BudgetSection
            title="Limites TikTok Ads"
            icon="🎵"
            scope="tiktok_ads"
            limits={tiktokLimits}
            setLimits={setTiktokLimits}
          />

          {/* Global section */}
          <div className="bg-slate-900 text-white rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🌐</span>
              <h2 className="text-base font-bold">Plafond global — Toutes plateformes confondues</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Ce plafond s&apos;applique a la somme de toutes les depenses : Google Ads + Meta Ads + TikTok Ads.
              C&apos;est le garde-fou ultime.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                await fetch('/api/marketing/sea/budgets/limits', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ scope: 'global', ...globalLimits }),
                })
              } catch {
                // silent
              }
            }}>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Limite jour (€)</label>
                  <input
                    type="number"
                    value={globalLimits.daily_limit ?? ''}
                    onChange={(e) => setGlobalLimits({ ...globalLimits, daily_limit: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="ex: 200"
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Limite semaine (€)</label>
                  <input
                    type="number"
                    value={globalLimits.weekly_limit ?? ''}
                    onChange={(e) => setGlobalLimits({ ...globalLimits, weekly_limit: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="ex: 1000"
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Limite mois (€)</label>
                  <input
                    type="number"
                    value={globalLimits.monthly_limit ?? ''}
                    onChange={(e) => setGlobalLimits({ ...globalLimits, monthly_limit: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="ex: 4000"
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setGlobalLimits({ ...globalLimits, auto_pause: !globalLimits.auto_pause })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${globalLimits.auto_pause ? 'bg-indigo-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${globalLimits.auto_pause ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-slate-300">Pause automatique toutes plateformes a 100%</span>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Enregistrer plafond global
              </button>
            </form>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Comment les plafonds interagissent</h3>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>Meta: 300€/jour, TikTok: 200€/jour, Global: 400€/jour → depense max reelle = 400€/jour</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                <span>Si une plateforme essaie de depasser le plafond global, elle est mise en pause automatiquement</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ</span>
                <span>Les alertes (70%, 90%, 100%) sont envoyees sur tous les canaux de notification configures</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
