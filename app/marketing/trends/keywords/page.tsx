'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TrendSignal, BuddyImpact } from '@/lib/marketing/trends'
import { IMPACT_LABELS, IMPACT_COLORS, SIGNAL_TYPE_LABELS } from '@/lib/marketing/trends'

const IMPACT_OPTIONS: BuddyImpact[] = ['direct', 'adjacent', 'low', 'none']

function ImpactBadge({ impact }: { impact: BuddyImpact }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${IMPACT_COLORS[impact]}`}>
      {IMPACT_LABELS[impact]}
    </span>
  )
}

function RelevanceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = score > 0.7 ? 'bg-green-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-slate-300'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500">{pct}%</span>
    </div>
  )
}

export default function TrendsKeywordsPage() {
  const [signals, setSignals] = useState<TrendSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'keyword_trend',
    detail: '',
    relevance_score: 0.5,
    buddy_impact: 'low' as BuddyImpact,
  })

  const fetchSignals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/trends/signals?type=keyword_trend')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setSignals(data ?? [])
    } catch {
      setSignals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      let detail: Record<string, unknown> = {}
      try { detail = JSON.parse(form.detail) } catch { detail = { raw: form.detail } }

      await fetch('/api/marketing/trends/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          source: 'manual',
          title: form.title,
          detail,
          relevance_score: form.relevance_score,
          buddy_impact: form.buddy_impact,
        }),
      })
      setShowModal(false)
      setForm({ title: '', type: 'keyword_trend', detail: '', relevance_score: 0.5, buddy_impact: 'low' })
      await fetchSignals()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  // Fake evolution placeholder (-15 to +30%)
  function fakeEvolution(id: string): number {
    const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
    return Math.round(((seed % 45) - 15))
  }

  function fakeVolume(id: string): string {
    const seed = id.charCodeAt(0) * id.charCodeAt(2 % id.length) + 1000
    const v = (seed % 9000) + 500
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
    return String(v)
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📈 Tendances</h1>
          <p className="text-sm text-slate-500 mt-1">Signaux de tendances et mots-cles detectes</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white text-sm">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 font-medium transition-colors ${period === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 font-medium transition-colors ${period === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Ce mois
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Ajouter un signal
          </button>
        </div>
      </div>

      {/* Agent cascade info */}
      <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-indigo-500 text-lg mt-0.5">🤖</span>
        <p className="text-sm text-indigo-700">
          <strong>Agent cascade :</strong> Un signal peut generer des propositions dans plusieurs blocs (Content, SEA, Social). Les IDs de propositions liees sont traces dans le champ <code className="bg-indigo-100 px-1 rounded">cascaded_to</code>.
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : signals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          Aucun signal de tendance. Ajoutez votre premier signal ou attendez la detection automatique.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Terme / Signal</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Type</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Volume</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Evolution</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Pertinence Buddy</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Impact</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Source</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {signals.map((s) => {
                const evo = fakeEvolution(s.id)
                const vol = fakeVolume(s.id)
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{s.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{SIGNAL_TYPE_LABELS[s.type]}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{vol}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-semibold ${evo > 0 ? 'text-green-600' : evo < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {evo > 0 ? `↑ +${evo}%` : evo < 0 ? `↓ ${evo}%` : '— 0%'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RelevanceBar score={s.relevance_score} />
                    </td>
                    <td className="px-4 py-3">
                      <ImpactBadge impact={s.buddy_impact} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 uppercase">{s.source}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add signal modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Nouveau signal</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: montre connectee enfant"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="keyword_trend">📈 Tendance keyword</option>
                  <option value="competitor_activity">🏢 Activite concurrent</option>
                  <option value="algo_update">🔄 Mise a jour algo</option>
                  <option value="industry_news">📰 Actualite sectorielle</option>
                  <option value="seasonal">📅 Saisonnier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detail (JSON ou texte libre)</label>
                <textarea
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  rows={3}
                  placeholder='{"url": "...", "notes": "..."}'
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pertinence Buddy : {Math.round(form.relevance_score * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={form.relevance_score}
                  onChange={(e) => setForm({ ...form, relevance_score: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Impact Buddy</label>
                <select
                  value={form.buddy_impact}
                  onChange={(e) => setForm({ ...form, buddy_impact: e.target.value as BuddyImpact })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  {IMPACT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{IMPACT_LABELS[opt]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Enregistrement...' : 'Ajouter le signal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
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
