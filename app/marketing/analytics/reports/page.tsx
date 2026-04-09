'use client'

import { useState, useEffect, useCallback } from 'react'

type ReportType = 'weekly_express' | 'monthly_full' | 'content_perf' | 'campaign_roi'
type FilterTab = 'all' | ReportType

interface Report {
  id: string
  type: ReportType
  period_start: string
  period_end: string
  generated_at: string
  insights: string[]
  recommendations: string[]
}

const TYPE_LABELS: Record<ReportType, string> = {
  weekly_express: 'Hebdo Express',
  monthly_full: 'Mensuel Complet',
  content_perf: 'Performance Contenu',
  campaign_roi: 'ROI Campagnes',
}

const TYPE_COLORS: Record<ReportType, string> = {
  weekly_express: 'bg-blue-100 text-blue-700',
  monthly_full: 'bg-purple-100 text-purple-700',
  content_perf: 'bg-green-100 text-green-700',
  campaign_roi: 'bg-orange-100 text-orange-700',
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'weekly_express', label: 'Hebdo Express' },
  { key: 'monthly_full', label: 'Mensuel' },
  { key: 'content_perf', label: 'Performance Contenu' },
  { key: 'campaign_roi', label: 'ROI Campagnes' },
]

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showGenForm, setShowGenForm] = useState(false)
  const [genType, setGenType] = useState<ReportType>('weekly_express')
  const [genStart, setGenStart] = useState('')
  const [genEnd, setGenEnd] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/analytics/reports')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setReports(data.reports ?? data ?? [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filtered = activeTab === 'all' ? reports : reports.filter((r) => r.type === activeTab)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genStart || !genEnd) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: genType, period_start: genStart, period_end: genEnd }),
      })
      setShowGenForm(false)
      fetchReports()
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
        <h1 className="text-2xl font-bold text-slate-900">📋 Rapports</h1>
        <button
          onClick={() => setShowGenForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          ➕ Generer un rapport
        </button>
      </div>

      {/* Generate form */}
      {showGenForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Nouveau rapport</h2>
          <form onSubmit={handleGenerate} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value as ReportType)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {(Object.keys(TYPE_LABELS) as ReportType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Debut</label>
              <input
                type="date"
                value={genStart}
                onChange={(e) => setGenStart(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Fin</label>
              <input
                type="date"
                value={genEnd}
                onChange={(e) => setGenEnd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Generation...' : 'Generer'}
            </button>
            <button
              type="button"
              onClick={() => setShowGenForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report list */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 text-sm font-medium">
            Les rapports seront generes automatiquement par les agents
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Ou generez-en un manuellement avec le bouton ci-dessus
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[report.type]}`}>
                    {TYPE_LABELS[report.type]}
                  </span>
                  <span className="text-sm text-slate-600">
                    {formatDate(report.period_start)} → {formatDate(report.period_end)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Genere le {formatDate(report.generated_at)}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-slate-500">
                    {report.insights?.length ?? 0} insights · {report.recommendations?.length ?? 0} reco
                  </span>
                  <span className="text-slate-400 text-sm">
                    {expandedId === report.id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expandedId === report.id && (
                <div className="border-t border-slate-100 px-6 py-4 space-y-4">
                  {report.insights?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">💡 Insights</h3>
                      <ul className="space-y-1">
                        {report.insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-slate-300 mt-0.5">•</span>
                            {ins}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">✅ Recommandations</h3>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-slate-300 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="pt-2">
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-400 cursor-not-allowed"
                      title="Export PDF bientot disponible"
                    >
                      📄 Exporter PDF
                    </button>
                    <span className="ml-2 text-xs text-slate-400">Bientot disponible</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
