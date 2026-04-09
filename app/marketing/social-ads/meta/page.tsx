'use client'

import { useState, useEffect, useCallback } from 'react'

interface Campaign {
  id: string
  name: string
  objective: 'conversions' | 'traffic' | 'reach' | 'engagement' | 'app_install'
  status: 'draft' | 'ready' | 'active' | 'paused' | 'ended'
  daily_budget: number | null
  monthly_budget: number | null
  ad_set_count: number
}

interface BudgetLimit {
  daily_limit: number | null
  weekly_limit: number | null
  monthly_limit: number | null
  auto_pause: boolean
}

const OBJECTIVE_LABELS: Record<string, string> = {
  conversions: 'Conversions',
  traffic:     'Trafic',
  reach:       'Portee',
  engagement:  'Engagement',
  app_install: 'Installs App',
}

const OBJECTIVE_COLORS: Record<string, string> = {
  conversions: 'bg-indigo-100 text-indigo-700',
  traffic:     'bg-blue-100 text-blue-700',
  reach:       'bg-purple-100 text-purple-700',
  engagement:  'bg-pink-100 text-pink-700',
  app_install: 'bg-cyan-100 text-cyan-700',
}

const STATUS_LABELS: Record<string, string> = {
  draft:  'Brouillon',
  ready:  'Pret',
  active: 'Actif',
  paused: 'Pause',
  ended:  'Termine',
}

const STATUS_STYLES: Record<string, string> = {
  draft:  'bg-slate-100 text-slate-600',
  ready:  'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended:  'bg-slate-200 text-slate-500',
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function globalStatusBadge(campaigns: Campaign[]): { label: string; style: string } {
  if (campaigns.some((c) => c.status === 'active')) return { label: 'ACTIF', style: 'bg-green-100 text-green-700' }
  if (campaigns.some((c) => c.status === 'paused')) return { label: 'PAUSE', style: 'bg-yellow-100 text-yellow-700' }
  return { label: 'DRAFT', style: 'bg-slate-100 text-slate-600' }
}

export default function MetaAdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [budgetLimit, setBudgetLimit] = useState<BudgetLimit | null>(null)
  const [loading, setLoading] = useState(true)
  const [objectiveFilter, setObjectiveFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newObjective, setNewObjective] = useState('conversions')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [campRes, limRes] = await Promise.allSettled([
        fetch('/api/marketing/social-ads/campaigns?platform=meta'),
        fetch('/api/marketing/sea/budgets/limits?scope=meta_ads'),
      ])
      if (campRes.status === 'fulfilled' && campRes.value.ok) {
        const data = await campRes.value.json()
        setCampaigns(data ?? [])
      }
      if (limRes.status === 'fulfilled' && limRes.value.ok) {
        const d = await limRes.value.json()
        setBudgetLimit(d)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = campaigns.filter((c) => {
    if (objectiveFilter && c.objective !== objectiveFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  const totalBudget = campaigns.reduce((s, c) => s + (c.monthly_budget ?? 0), 0)
  const globalBadge = globalStatusBadge(campaigns)
  const budgetPct = budgetLimit?.monthly_limit && totalBudget > 0
    ? Math.min(100, (totalBudget / budgetLimit.monthly_limit) * 100)
    : null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/social-ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'meta', name: newName.trim(), objective: newObjective }),
      })
      setNewName('')
      setNewObjective('conversions')
      setShowModal(false)
      await fetchData()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">📢 Meta Ads (Facebook + Instagram)</h1>
          {!loading && (
            <span className={`inline-flex rounded-full text-xs font-semibold px-3 py-1 ${globalBadge.style}`}>
              {globalBadge.label}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ➕ Nouvelle campagne Meta
        </button>
      </div>

      {/* Safety reminder */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 text-sm text-amber-800 w-fit">
        <span>🔒</span>
        <span>Aucune activation sans validation humaine</span>
      </div>

      {/* Budget bar */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs uppercase font-medium text-slate-500 mb-1">Budget mensuel alloue</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalBudget > 0 ? formatEur(totalBudget) : <span className="text-slate-400">€ --</span>}
            </p>
            {budgetLimit?.monthly_limit && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Plafond: {formatEur(budgetLimit.monthly_limit)}</span>
                  <span>{budgetPct?.toFixed(0) ?? 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${(budgetPct ?? 0) >= 90 ? 'bg-red-500' : (budgetPct ?? 0) >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${budgetPct ?? 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs uppercase font-medium text-slate-500 mb-1">Campagnes actives</p>
            <p className="text-2xl font-bold text-green-600">
              {campaigns.filter((c) => c.status === 'active').length}
            </p>
            <p className="text-xs text-slate-400 mt-1">sur {campaigns.length} campagnes</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs uppercase font-medium text-slate-500 mb-1">Ad sets totaux</p>
            <p className="text-2xl font-bold text-slate-900">
              {campaigns.reduce((s, c) => s + (c.ad_set_count ?? 0), 0)}
            </p>
          </div>
        </div>
      )}

      {/* A/B testing info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🧪</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tests A/B automatiques</h3>
            <p className="text-sm text-blue-700">
              Les agents creent systematiquement 2-3 variantes de creatives par ad set.
              Chaque variante teste un element different (visuel, headline, CTA) pour identifier
              ce qui performe le mieux avant de scaler.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={objectiveFilter}
          onChange={(e) => setObjectiveFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tous les objectifs</option>
          {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          {campaigns.length === 0
            ? 'Aucune campagne Meta. Cliquez sur "Nouvelle campagne Meta" pour commencer.'
            : 'Aucune campagne correspondant aux filtres.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">📢</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-base truncate">{c.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${OBJECTIVE_COLORS[c.objective]}`}>
                        {OBJECTIVE_LABELS[c.objective]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ad sets: {c.ad_set_count ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    {c.daily_budget != null && (
                      <p className="text-xs text-slate-500">{formatEur(c.daily_budget)}/jour</p>
                    )}
                    {c.monthly_budget != null && (
                      <p className="text-sm font-semibold text-slate-700">{formatEur(c.monthly_budget)}/mois</p>
                    )}
                    {c.daily_budget == null && c.monthly_budget == null && (
                      <p className="text-xs text-slate-400">Budget non defini</p>
                    )}
                  </div>
                  <span className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-1 ${STATUS_STYLES[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nouvelle campagne Meta</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom de la campagne</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Prospection — Conversions FR"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Objectif</label>
                <select
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creation...' : 'Creer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setNewName(''); setNewObjective('conversions') }}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
