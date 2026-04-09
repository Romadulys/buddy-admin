'use client'

import { useState, useEffect, useCallback } from 'react'

interface Keyword {
  id: string
  keyword: string
  cluster: string
  position: number
  previous_position: number | null
  impressions: number
  clicks: number
  ctr: number
  opportunity: number
  volume_estimate: number | null
  tracked_since: string
  updated_at: string
}

const CLUSTER_COLORS: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-purple-100 text-purple-700',
  produit: 'bg-blue-100 text-blue-700',
  blog: 'bg-green-100 text-green-700',
  concurrence: 'bg-orange-100 text-orange-700',
  local: 'bg-pink-100 text-pink-700',
}

function clusterColor(cluster: string): string {
  const key = cluster.toLowerCase()
  return CLUSTER_COLORS[key] ?? CLUSTER_COLORS.default
}

function opportunityColor(score: number): string {
  if (score > 0.7) return 'bg-green-500'
  if (score > 0.4) return 'bg-yellow-500'
  return 'bg-red-400'
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

function PositionDelta({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return <span className="text-slate-500 font-semibold">{current}</span>
  const delta = previous - current // positive = improved (lower is better in rankings)
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-green-600 font-semibold">
        {current} <span className="text-xs">↑{delta}</span>
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 text-red-500 font-semibold">
        {current} <span className="text-xs">↓{Math.abs(delta)}</span>
      </span>
    )
  }
  return <span className="text-slate-700 font-semibold">{current}</span>
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [clusterFilter, setClusterFilter] = useState('')
  const [sort, setSort] = useState('position')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newCluster, setNewCluster] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchKeywords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/seo/keywords')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setKeywords(data.keywords ?? data ?? [])
    } catch {
      setKeywords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const clusters = Array.from(new Set(keywords.map((k) => k.cluster))).filter(Boolean)

  const filtered = keywords
    .filter((k) => !clusterFilter || k.cluster === clusterFilter)
    .sort((a, b) => {
      if (sort === 'position') return a.position - b.position
      if (sort === 'opportunity') return b.opportunity - a.opportunity
      if (sort === 'impressions') return b.impressions - a.impressions
      return 0
    })

  const stats = {
    total: keywords.length,
    avgPosition: keywords.length
      ? (keywords.reduce((s, k) => s + k.position, 0) / keywords.length).toFixed(1)
      : '--',
    totalClicks: keywords.reduce((s, k) => s + k.clicks, 0),
  }

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim(), cluster: newCluster.trim() || 'default' }),
      })
      setNewKeyword('')
      setNewCluster('')
      setShowForm(false)
      await fetchKeywords()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce mot-cle ?')) return
    try {
      await fetch(`/api/marketing/seo/keywords/${id}`, { method: 'DELETE' })
      await fetchKeywords()
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mots-cles SEO</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Ajouter un mot-cle
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Mots-cles suivis</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Position moyenne</p>
          <p className="text-2xl font-bold text-slate-900">{stats.avgPosition}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Clics totaux</p>
          <p className="text-2xl font-bold text-slate-900">{formatNumber(stats.totalClicks)}</p>
        </div>
      </div>

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleAddKeyword}
          className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Mot-cle</label>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="ex: crm gratuit PME"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="flex-1 min-w-36">
            <label className="block text-xs font-medium text-slate-600 mb-1">Cluster</label>
            <input
              type="text"
              value={newCluster}
              onChange={(e) => setNewCluster(e.target.value)}
              placeholder="ex: produit"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Ajout...' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={clusterFilter}
          onChange={(e) => setClusterFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tous les clusters</option>
          {clusters.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="position">Trier par position</option>
          <option value="opportunity">Trier par opportunite</option>
          <option value="impressions">Trier par impressions</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          Aucun mot-cle suivi. Ajoutez vos premiers mots-cles.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Mot-cle</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Cluster</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Position</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Impressions</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Clics</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">CTR</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Opportunite</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((kw) => (
                <>
                  <tr
                    key={kw.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === kw.id ? null : kw.id)}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{kw.keyword}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 ${clusterColor(kw.cluster)}`}>
                        {kw.cluster}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <PositionDelta current={kw.position} previous={kw.previous_position} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatNumber(kw.impressions)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatNumber(kw.clicks)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{(kw.ctr * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${opportunityColor(kw.opportunity)}`}
                            style={{ width: `${kw.opportunity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{(kw.opportunity * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(kw.id) }}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        Suppr.
                      </button>
                    </td>
                  </tr>
                  {expandedId === kw.id && (
                    <tr key={`${kw.id}-detail`} className="bg-indigo-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="flex flex-wrap gap-6 text-sm text-slate-700">
                          <div>
                            <span className="font-medium text-slate-500">Volume estime :</span>{' '}
                            {kw.volume_estimate != null ? formatNumber(kw.volume_estimate) + '/mois' : '--'}
                          </div>
                          <div>
                            <span className="font-medium text-slate-500">Suivi depuis :</span>{' '}
                            {new Date(kw.tracked_since).toLocaleDateString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium text-slate-500">Mis a jour :</span>{' '}
                            {new Date(kw.updated_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
