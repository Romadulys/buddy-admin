'use client'

import { useState, useEffect, useCallback } from 'react'

type Period = '7j' | '30j' | '90j'

interface DashboardData {
  sessions?: number
  visitors?: number
  conversion_rate?: number
  mrr?: number
}

const TRAFFIC_SOURCES = [
  { label: 'Organic Search', pct: 42, color: 'bg-green-500' },
  { label: 'Direct', pct: 28, color: 'bg-blue-500' },
  { label: 'Social', pct: 18, color: 'bg-purple-500' },
  { label: 'Paid Search', pct: 8, color: 'bg-orange-500' },
  { label: 'Referral', pct: 4, color: 'bg-pink-500' },
]

const INSIGHTS = [
  'Le trafic organic a bondi de 12% grace a l\'article publie le 15/04',
  'Le taux de conversion mobile est 2x inferieur au desktop',
  '3 mots-cles ont gagne plus de 5 positions cette semaine',
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('30j')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketing/analytics/dashboard?period=${period}`)
      if (!res.ok) throw new Error('Fetch error')
      const json = await res.json()
      setData(json ?? null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const kpis = [
    {
      label: 'Sessions',
      value: data?.sessions != null ? data.sessions.toLocaleString('fr-FR') : '12 450',
      trend: '+8.4%',
      up: true,
    },
    {
      label: 'Visiteurs',
      value: data?.visitors != null ? data.visitors.toLocaleString('fr-FR') : '8 230',
      trend: '+5.1%',
      up: true,
    },
    {
      label: 'Taux de conversion',
      value: data?.conversion_rate != null ? data.conversion_rate.toFixed(1) + '%' : '3.2%',
      trend: '-0.3%',
      up: false,
    },
    {
      label: 'Revenue (MRR)',
      value: data?.mrr != null ? '€' + data.mrr.toLocaleString('fr-FR') : '€4 850',
      trend: '+12.7%',
      up: true,
    },
  ]

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📊 Dashboard Analytics</h1>
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

      {/* Info notice */}
      <div className="mb-6 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
        Connectez Google Analytics dans{' '}
        <a href="/marketing/platforms" className="underline font-medium">
          Connexions
        </a>{' '}
        pour des donnees reelles
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{kpi.value}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-semibold flex items-center gap-0.5 ${
                  kpi.up ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {kpi.up ? '↑' : '↓'} {kpi.trend}
              </span>
              <span className="text-xs text-slate-400">vs periode precedente</span>
            </div>
          </div>
        ))}
      </div>

      {/* Traffic by source */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Trafic par source</h2>
        <div className="space-y-3">
          {TRAFFIC_SOURCES.map((src) => (
            <div key={src.label} className="flex items-center gap-3">
              <span className="w-32 text-sm text-slate-600 shrink-0">{src.label}</span>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${src.color} transition-all`}
                  style={{ width: `${src.pct}%` }}
                />
              </div>
              <span className="w-10 text-sm font-medium text-slate-700 text-right">
                {src.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent insights */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Insights agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INSIGHTS.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100"
            >
              <span className="text-xl shrink-0">💡</span>
              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
