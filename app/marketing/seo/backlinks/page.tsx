'use client'

import { useState, useEffect, useCallback } from 'react'

interface Backlink {
  id: string
  referring_domain: string
  target_url: string
  quality: number
  status: 'active' | 'lost'
  detected_at: string
}

interface BacklinkStats {
  total: number
  active: number
  lost: number
  new_this_week: number
}

function qualityColor(score: number): string {
  if (score > 0.7) return 'bg-green-500'
  if (score > 0.4) return 'bg-yellow-500'
  return 'bg-red-400'
}

function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export default function BacklinksPage() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formDomain, setFormDomain] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formQuality, setFormQuality] = useState('0.5')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [blRes, statsRes] = await Promise.all([
        fetch('/api/marketing/seo/backlinks'),
        fetch('/api/marketing/seo/backlinks/stats'),
      ])
      const blData = blRes.ok ? await blRes.json() : {}
      const statsData = statsRes.ok ? await statsRes.json() : {}
      setBacklinks(blData.backlinks ?? blData ?? [])
      setStats(statsData.stats ?? statsData ?? null)
    } catch {
      setBacklinks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = backlinks.filter(
    (b) => !statusFilter || b.status === statusFilter,
  )

  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDomain.trim() || !formTarget.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/seo/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referring_domain: formDomain.trim(),
          target_url: formTarget.trim(),
          quality: parseFloat(formQuality),
        }),
      })
      setFormDomain('')
      setFormTarget('')
      setFormQuality('0.5')
      setShowForm(false)
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
        <h1 className="text-2xl font-bold text-slate-900">Backlinks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Ajouter
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Total liens</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.total ?? '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats?.active ?? '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Perdus</p>
          <p className="text-2xl font-bold text-red-500">{stats?.lost ?? '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs uppercase font-medium text-slate-500 mb-1">Nouveaux cette semaine</p>
          <p className="text-2xl font-bold text-indigo-600">{stats?.new_this_week ?? '--'}</p>
        </div>
      </div>

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleAddBacklink}
          className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Domaine referent</label>
            <input
              type="text"
              value={formDomain}
              onChange={(e) => setFormDomain(e.target.value)}
              placeholder="ex: example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Page cible</label>
            <input
              type="text"
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              placeholder="ex: https://monsite.com/page"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="w-36">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Qualite ({parseFloat(formQuality).toFixed(1)})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formQuality}
              onChange={(e) => setFormQuality(e.target.value)}
              className="w-full"
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

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tous</option>
          <option value="active">Actifs</option>
          <option value="lost">Perdus</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          Aucun backlink detecte.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Domaine referent</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Page cible</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Qualite</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Detecte le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-slate-900" title={bl.referring_domain}>
                    {truncate(bl.referring_domain, 35)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500" title={bl.target_url}>
                    {truncate(bl.target_url, 45)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${qualityColor(bl.quality)}`}
                          style={{ width: `${bl.quality * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{(bl.quality * 10).toFixed(1)}/10</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {bl.status === 'active' ? (
                      <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-100 text-green-700">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-100 text-red-700">
                        Perdu
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(bl.detected_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
