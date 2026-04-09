'use client'

import { useState, useEffect, useCallback } from 'react'

interface Campaign {
  id: string
  name: string
  monthly_budget: number | null
}

interface BudgetLimits {
  daily_limit: number | null
  weekly_limit: number | null
  monthly_limit: number | null
  auto_pause: boolean
}

interface SpendHistoryRow {
  date: string
  spend: number
  clicks: number
  conversions: number
  roas: number
}

const SIMULATION_SCENARIOS = [
  {
    label: 'Scenario A',
    budget: 500,
    clicks: 1200,
    conversions: 60,
    roas: 3.5,
    warning: false,
  },
  {
    label: 'Scenario B',
    budget: 1000,
    clicks: 2800,
    conversions: 140,
    roas: 3.2,
    warning: false,
  },
  {
    label: 'Scenario C',
    budget: 2000,
    clicks: 5000,
    conversions: 250,
    roas: 2.8,
    warning: true,
    warningText: 'Rendement decroissant',
  },
]

function formatEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function BudgetsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [totalBudget, setTotalBudget] = useState<string>('')
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [aiOptimize, setAiOptimize] = useState(false)
  const [limits, setLimits] = useState<BudgetLimits>({
    daily_limit: null,
    weekly_limit: null,
    monthly_limit: null,
    auto_pause: true,
  })
  const [savingLimits, setSavingLimits] = useState(false)
  const [limitsSaved, setLimitsSaved] = useState(false)
  const [spendHistory] = useState<SpendHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  const totalNum = parseFloat(totalBudget) || 0

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [camRes, limRes] = await Promise.allSettled([
        fetch('/api/marketing/sea/budgets'),
        fetch('/api/marketing/sea/budgets/limits'),
      ])
      if (camRes.status === 'fulfilled' && camRes.value.ok) {
        const data = await camRes.value.json()
        const camps: Campaign[] = data.campaigns ?? data ?? []
        setCampaigns(camps)
        // Init allocations from existing monthly budgets
        const alloc: Record<string, number> = {}
        camps.forEach((c) => { alloc[c.id] = c.monthly_budget ?? 0 })
        setAllocations(alloc)
        const total = camps.reduce((s, c) => s + (c.monthly_budget ?? 0), 0)
        if (total > 0) setTotalBudget(String(total))
      }
      if (limRes.status === 'fulfilled' && limRes.value.ok) {
        const data = await limRes.value.json()
        setLimits({
          daily_limit: data.daily_limit ?? null,
          weekly_limit: data.weekly_limit ?? null,
          monthly_limit: data.monthly_limit ?? null,
          auto_pause: data.auto_pause ?? true,
        })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const allocTotal = Object.values(allocations).reduce((s, v) => s + v, 0)

  const handleAllocationChange = (id: string, value: string) => {
    const n = parseFloat(value) || 0
    setAllocations((prev) => ({ ...prev, [id]: n }))
  }

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLimits(true)
    try {
      await fetch('/api/marketing/sea/budgets/limits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limits),
      })
      setLimitsSaved(true)
      setTimeout(() => setLimitsSaved(false), 3000)
    } catch {
      // silent
    } finally {
      setSavingLimits(false)
    }
  }

  const alertThresholds = [
    { pct: 70, label: '70%', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { pct: 90, label: '90%', style: 'bg-orange-100 text-orange-700 border-orange-200' },
    { pct: 100, label: '100%', style: 'bg-red-100 text-red-700 border-red-200' },
  ]

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">💵 Budget & Performance</h1>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-3 text-sm text-amber-800 w-fit">
          <span>🔒</span>
          <span>Aucun budget n&apos;est depense sans validation humaine</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Budget allocation section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Repartition du budget</h2>

            {/* Total budget */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 mb-1">Budget mensuel total (€)</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="ex: 2000"
                min="0"
                className="border border-slate-300 rounded-lg px-4 py-3 text-2xl font-bold w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 text-indigo-600"
              />
            </div>

            {/* AI optimize toggle */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-lg">
              <button
                type="button"
                onClick={() => setAiOptimize((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiOptimize ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${aiOptimize ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-slate-700">Laisser l&apos;IA optimiser la repartition</span>
              <span className="text-xs text-slate-400 ml-1">(bientot disponible)</span>
            </div>

            {/* Per-campaign allocations */}
            {campaigns.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune campagne a budgetiser. Creez des campagnes d&apos;abord.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {campaigns.map((c) => {
                  const val = allocations[c.id] ?? 0
                  const pct = totalNum > 0 ? Math.min(100, (val / totalNum) * 100) : 0
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="text-sm text-slate-700 font-medium w-40 truncate flex-shrink-0">{c.name}</span>
                      <input
                        type="number"
                        value={val || ''}
                        onChange={(e) => handleAllocationChange(c.id, e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        disabled={aiOptimize}
                      />
                      <span className="text-xs text-slate-400">€/mois</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
                {allocTotal > 0 && totalNum > 0 && Math.abs(allocTotal - totalNum) > 1 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Repartition: {formatEur(allocTotal)} / {formatEur(totalNum)} alloues
                    {allocTotal > totalNum ? ' (depassement)' : ' (reste a allouer)'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Safety limits section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Limites de securite</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Google Ads</span>
            </div>

            <form onSubmit={handleSaveLimits}>
              {/* Limit inputs */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Limite jour (€)</label>
                  <input
                    type="number"
                    value={limits.daily_limit ?? ''}
                    onChange={(e) => setLimits((prev) => ({ ...prev, daily_limit: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="ex: 100"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Limite semaine (€)</label>
                  <input
                    type="number"
                    value={limits.weekly_limit ?? ''}
                    onChange={(e) => setLimits((prev) => ({ ...prev, weekly_limit: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="ex: 500"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Limite mois (€)</label>
                  <input
                    type="number"
                    value={limits.monthly_limit ?? ''}
                    onChange={(e) => setLimits((prev) => ({ ...prev, monthly_limit: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="ex: 2000"
                    min="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Alert thresholds */}
              <div className="mb-5">
                <p className="text-xs font-medium text-slate-600 mb-2">Alertes automatiques</p>
                <div className="flex gap-2">
                  {alertThresholds.map((t) => (
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
                  onClick={() => setLimits((prev) => ({ ...prev, auto_pause: !prev.auto_pause }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${limits.auto_pause ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${limits.auto_pause ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">Pause automatique a 100% du budget</span>
              </div>

              <button
                type="submit"
                disabled={savingLimits}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {savingLimits ? 'Enregistrement...' : limitsSaved ? '✓ Enregistre' : 'Enregistrer les limites'}
              </button>
            </form>
          </div>

          {/* Simulation section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Simulations de performance</h2>
            <p className="text-xs text-slate-500 mb-4">
              Les simulations seront personnalisees quand les campagnes seront actives
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SIMULATION_SCENARIOS.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border p-4 ${s.warning ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{s.label}</span>
                    {s.warning && (
                      <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full border border-orange-200">
                        ⚠️ {s.warningText}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-slate-900 mb-3">{formatEur(s.budget)}/mois</p>
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Clics estimes</span>
                      <span className="font-semibold">~{s.clicks.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversions</span>
                      <span className="font-semibold">~{s.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROAS estime</span>
                      <span className={`font-bold ${s.roas >= 3 ? 'text-green-600' : 'text-orange-600'}`}>{s.roas}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spend history */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Historique des depenses</h2>
            {spendHistory.length === 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Date', 'Depense', 'Clics', 'Conversions', 'ROAS'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                        Les donnees de depenses apparaitront ici une fois les campagnes actives
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Date', 'Depense', 'Clics', 'Conversions', 'ROAS'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {spendHistory.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-700">{row.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatEur(row.spend)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.clicks.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.conversions}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">{row.roas.toFixed(1)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
