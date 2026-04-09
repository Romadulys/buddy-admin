'use client'

import { useState, useEffect, useCallback } from 'react'

interface CampaignPerformance {
  spend: number
  clicks: number
  conversions: number
  roas: number
}

interface Campaign {
  id: string
  name: string
  type: 'search' | 'shopping' | 'pmax' | 'youtube' | 'remarketing' | 'display'
  status: 'draft' | 'ready' | 'active' | 'paused' | 'ended'
  daily_budget: number | null
  monthly_budget: number | null
  adgroups_count: number
  keywords_count: number
  performance: CampaignPerformance | null
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  search: '🔍',
  shopping: '🛒',
  pmax: '🎯',
  youtube: '📺',
  remarketing: '🔄',
  display: '🖼️',
}

const TYPE_LABELS: Record<string, string> = {
  search: 'Search',
  shopping: 'Shopping',
  pmax: 'Performance Max',
  youtube: 'YouTube Ads',
  remarketing: 'Remarketing',
  display: 'Display',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  ready: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-slate-200 text-slate-500',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  ready: 'Pret',
  active: 'Actif',
  paused: 'Pause',
  ended: 'Termine',
}

function globalStatusBadge(campaigns: Campaign[]): { label: string; style: string } {
  if (campaigns.some((c) => c.status === 'active')) {
    return { label: 'ACTIF', style: 'bg-green-100 text-green-700' }
  }
  if (campaigns.some((c) => c.status === 'paused')) {
    return { label: 'PAUSE', style: 'bg-yellow-100 text-yellow-700' }
  }
  return { label: 'DRAFT', style: 'bg-slate-100 text-slate-600' }
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('search')
  const [submitting, setSubmitting] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/sea/campaigns')
      if (!res.ok) throw new Error('fetch error')
      const data = await res.json()
      setCampaigns(data.campaigns ?? data ?? [])
    } catch {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const filtered = campaigns.filter((c) => {
    if (typeFilter && c.type !== typeFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  const totalBudget = campaigns.reduce((s, c) => s + (c.monthly_budget ?? 0), 0)
  const totalSpend = campaigns.reduce((s, c) => s + (c.performance?.spend ?? 0), 0)
  const avgRoas = (() => {
    const active = campaigns.filter((c) => c.performance?.roas)
    if (!active.length) return null
    return (active.reduce((s, c) => s + (c.performance!.roas ?? 0), 0) / active.length).toFixed(1)
  })()

  const globalBadge = globalStatusBadge(campaigns)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/sea/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), type: newType }),
      })
      setNewName('')
      setNewType('search')
      setShowModal(false)
      await fetchCampaigns()
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
          <h1 className="text-2xl font-bold text-slate-900">💰 SEA — Google Ads</h1>
          {!loading && (
            <span className={`inline-flex rounded-full text-xs font-semibold px-3 py-1 ${globalBadge.style}`}>
              {globalBadge.label}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          ➕ Nouvelle campagne
        </button>
      </div>

      {/* Budget summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Budget mensuel</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalBudget > 0 ? formatEur(totalBudget) : <span className="text-slate-400">€ --</span>}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Depense MTD</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalSpend > 0 ? formatEur(totalSpend) : <span className="text-slate-400">€0</span>}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">ROAS global</p>
          <p className="text-2xl font-bold text-slate-900">
            {avgRoas != null ? <span className="text-green-600">{avgRoas}x</span> : <span className="text-slate-400">--</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            ? 'Aucune campagne. Creez votre premiere campagne Google Ads.'
            : 'Aucune campagne correspondant aux filtres.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-indigo-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{TYPE_ICONS[c.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-base truncate">{c.name}</h3>
                      <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        {TYPE_LABELS[c.type]}
                      </span>
                    </div>
                    {/* Stats row */}
                    <p className="text-xs text-slate-500">
                      Groupes: {c.adgroups_count} &nbsp;|&nbsp; Mots-cles: {c.keywords_count} &nbsp;|&nbsp; Statut: {STATUS_LABELS[c.status]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Budget */}
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
              {/* Active performance */}
              {c.status === 'active' && c.performance && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Depense</p>
                    <p className="text-sm font-bold text-slate-800">{formatEur(c.performance.spend)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Clics</p>
                    <p className="text-sm font-bold text-slate-800">{c.performance.clicks.toLocaleString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Conversions</p>
                    <p className="text-sm font-bold text-slate-800">{c.performance.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ROAS</p>
                    <p className="text-sm font-bold text-green-600">{c.performance.roas.toFixed(1)}x</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Creation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nouvelle campagne</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom de la campagne</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Brand — Search FR"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type de campagne</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {TYPE_ICONS[k]} {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creation...' : 'Creer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setNewName(''); setNewType('search') }}
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
