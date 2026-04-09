'use client'

import { useState, useEffect, useCallback } from 'react'

type Severity = 'critical' | 'warning' | 'info'

interface SEOIssue {
  id: string
  severity: Severity
  type: string
  url: string
  description: string
  fix_suggestion: string
}

interface CoreWebVitals {
  lcp: number | null // seconds
  cls: number | null
  inp: number | null // ms
}

interface AuditHistory {
  id: string
  date: string
  score: number
}

interface Audit {
  id: string
  score: number
  pages_indexed: number
  pages_with_errors: number
  core_web_vitals: CoreWebVitals
  issues: SEOIssue[]
  history: AuditHistory[]
  created_at: string
}

function scoreColor(score: number): string {
  if (score > 80) return '#22c55e' // green-500
  if (score > 60) return '#eab308' // yellow-500
  return '#ef4444' // red-500
}

function scoreLabel(score: number): string {
  if (score > 80) return 'Bon'
  if (score > 60) return 'A ameliorer'
  return 'Critique'
}

function lcpStatus(lcp: number | null): { label: string; color: string } {
  if (lcp === null) return { label: '--', color: 'text-slate-400' }
  if (lcp < 2.5) return { label: 'Bon', color: 'text-green-600' }
  if (lcp < 4.0) return { label: 'A ameliorer', color: 'text-yellow-600' }
  return { label: 'Mauvais', color: 'text-red-600' }
}

function clsStatus(cls: number | null): { label: string; color: string } {
  if (cls === null) return { label: '--', color: 'text-slate-400' }
  if (cls < 0.1) return { label: 'Bon', color: 'text-green-600' }
  if (cls < 0.25) return { label: 'A ameliorer', color: 'text-yellow-600' }
  return { label: 'Mauvais', color: 'text-red-600' }
}

function inpStatus(inp: number | null): { label: string; color: string } {
  if (inp === null) return { label: '--', color: 'text-slate-400' }
  if (inp < 200) return { label: 'Bon', color: 'text-green-600' }
  if (inp < 500) return { label: 'A ameliorer', color: 'text-yellow-600' }
  return { label: 'Mauvais', color: 'text-red-600' }
}

const SEVERITY_CONFIG: Record<Severity, { icon: string; label: string; bg: string; text: string }> = {
  critical: { icon: 'C', label: 'Critique', bg: 'bg-red-100', text: 'text-red-700' },
  warning: { icon: 'W', label: 'Avertissement', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  info: { icon: 'I', label: 'Info', bg: 'bg-blue-100', text: 'text-blue-700' },
}

function HealthGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = Math.PI * radius // half-circle
  const progress = (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Background arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc — using stroke-dasharray trick on a path */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 188.5} 188.5`}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="26" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="70" y="78" textAnchor="middle" fontSize="10" fill="#64748b">
          /100
        </text>
      </svg>
      <span className="text-sm font-semibold mt-1" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  )
}

export default function TechnicalSEOPage() {
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)

  const fetchAudit = useCallback(async (id?: string) => {
    setLoading(true)
    try {
      const url = id
        ? `/api/marketing/seo/audits/${id}`
        : '/api/marketing/seo/audits/latest'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setAudit(data.audit ?? data ?? null)
    } catch {
      setAudit(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  const handleLaunchAudit = async () => {
    setLaunching(true)
    try {
      await fetch('/api/marketing/seo/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock: true }),
      })
      await fetchAudit()
    } catch {
      // silent
    } finally {
      setLaunching(false)
    }
  }

  const handleSelectHistory = (id: string) => {
    setSelectedAuditId(id)
    fetchAudit(id)
  }

  const issues = audit?.issues ?? []
  const sortedIssues = [...issues].sort((a, b) => {
    const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const infoCount = issues.filter((i) => i.severity === 'info').length

  const cwv = audit?.core_web_vitals ?? { lcp: null, cls: null, inp: null }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SEO Technique</h1>
        <button
          onClick={handleLaunchAudit}
          disabled={launching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {launching ? 'Analyse en cours...' : 'Lancer un audit'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : !audit ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          Aucun audit disponible. Lancez votre premier audit SEO.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Health score + stats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-wrap gap-8 items-center">
            <div>
              <p className="text-xs uppercase font-medium text-slate-500 mb-3 text-center">Score de sante</p>
              <HealthGauge score={audit.score} />
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs uppercase font-medium text-slate-500 mb-1">Pages indexees</p>
                <p className="text-2xl font-bold text-slate-900">{audit.pages_indexed}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-slate-500 mb-1">Pages avec erreurs</p>
                <p className="text-2xl font-bold text-red-600">{audit.pages_with_errors}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-medium text-slate-500 mb-1">Date d'audit</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(audit.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-3">Core Web Vitals</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* LCP */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-medium text-slate-500">LCP</p>
                  <span className={`text-xs font-semibold ${lcpStatus(cwv.lcp).color}`}>
                    {lcpStatus(cwv.lcp).label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {cwv.lcp != null ? `${cwv.lcp.toFixed(1)}s` : '--'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Largest Contentful Paint</p>
              </div>
              {/* CLS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-medium text-slate-500">CLS</p>
                  <span className={`text-xs font-semibold ${clsStatus(cwv.cls).color}`}>
                    {clsStatus(cwv.cls).label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {cwv.cls != null ? cwv.cls.toFixed(3) : '--'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Cumulative Layout Shift</p>
              </div>
              {/* INP */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-medium text-slate-500">INP</p>
                  <span className={`text-xs font-semibold ${inpStatus(cwv.inp).color}`}>
                    {inpStatus(cwv.inp).label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {cwv.inp != null ? `${cwv.inp}ms` : '--'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Interaction to Next Paint</p>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base font-semibold text-slate-800">Problemes detectes</h2>
              {criticalCount > 0 && (
                <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-100 text-red-700">
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-100 text-yellow-700">
                  {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                </span>
              )}
              {infoCount > 0 && (
                <span className="inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-blue-700">
                  {infoCount} info{infoCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {sortedIssues.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
                Aucun probleme detecte — excellent travail !
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {sortedIssues.map((issue) => {
                  const cfg = SEVERITY_CONFIG[issue.severity]
                  return (
                    <div key={issue.id} className="px-4 py-4 flex gap-4">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}
                      >
                        {cfg.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex rounded-full text-xs font-medium px-2 py-0.5 ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{issue.type}</span>
                          <span className="text-xs text-slate-400 truncate max-w-xs" title={issue.url}>
                            {issue.url}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{issue.description}</p>
                        {issue.fix_suggestion && (
                          <p className="text-xs text-slate-500 italic mt-1">
                            Suggestion : {issue.fix_suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Audit history */}
          {audit.history && audit.history.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-3">Historique des audits</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {audit.history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleSelectHistory(h.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors ${
                      selectedAuditId === h.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className="text-sm text-slate-700">
                      {new Date(h.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: scoreColor(h.score) }}
                    >
                      {h.score}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
