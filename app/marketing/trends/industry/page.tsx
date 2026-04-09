'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TrendSignal } from '@/lib/marketing/trends'

interface RssSource {
  name: string
  url: string
  enabled: boolean
}

const DEFAULT_RSS_SOURCES: RssSource[] = [
  { name: 'Google Search Central Blog', url: 'https://developers.google.com/search/blog', enabled: true },
  { name: 'Meta Business Blog',         url: 'https://www.facebook.com/business/news',   enabled: true },
  { name: 'TikTok Newsroom',            url: 'https://newsroom.tiktok.com',               enabled: true },
  { name: 'Search Engine Journal',      url: 'https://www.searchenginejournal.com',       enabled: true },
  { name: 'Blog du Moderateur',         url: 'https://www.blogdumoderateur.com',          enabled: false },
]

function SignalRow({ signal }: { signal: TrendSignal }) {
  const detail = signal.detail as Record<string, string>
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400 mt-2" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{signal.title}</p>
        {detail.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{detail.description}</p>
        )}
        {detail.url && (
          <a
            href={detail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:underline mt-1 inline-block"
          >
            {detail.url}
          </a>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <span className="text-xs text-slate-400">
          {new Date(signal.created_at).toLocaleDateString('fr-FR')}
        </span>
        <br />
        <span className="text-xs uppercase text-slate-300">{signal.source}</span>
      </div>
    </div>
  )
}

export default function IndustryPage() {
  const [algoSignals, setAlgoSignals] = useState<TrendSignal[]>([])
  const [newsSignals, setNewsSignals] = useState<TrendSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [rssSources, setRssSources] = useState<RssSource[]>(DEFAULT_RSS_SOURCES)

  const fetchSignals = useCallback(async () => {
    setLoading(true)
    try {
      const [algoRes, newsRes] = await Promise.all([
        fetch('/api/marketing/trends/signals?type=algo_update'),
        fetch('/api/marketing/trends/signals?type=industry_news'),
      ])
      const [algoData, newsData] = await Promise.all([algoRes.json(), newsRes.json()])
      setAlgoSignals(algoData ?? [])
      setNewsSignals(newsData ?? [])
    } catch {
      setAlgoSignals([])
      setNewsSignals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  const toggleSource = (idx: number) => {
    setRssSources((prev) => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🔄 Veille Algo & Sectorielle</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suivi des mises a jour algorithmiques et des actualites du secteur
        </p>
      </div>

      {/* Agent filter info */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-amber-500 text-lg mt-0.5">🤖</span>
        <p className="text-sm text-amber-700">
          L'agent filtre et remonte uniquement ce qui impacte Buddy — mises a jour algo, nouvelles sur le marche de la montre connectee pour enfants et la securite numerique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Algo updates */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg">🔄</span>
            <h2 className="font-semibold text-slate-900">Mises a jour algorithmes</h2>
            <span className="ml-auto text-xs text-slate-400">{algoSignals.length} signaux</span>
          </div>
          <div className="px-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Chargement...</p>
            ) : algoSignals.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Aucune mise a jour algo detectee.</p>
            ) : (
              algoSignals.map((s) => <SignalRow key={s.id} signal={s} />)
            )}
          </div>
        </div>

        {/* Industry news */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h2 className="font-semibold text-slate-900">Actualites sectorielles</h2>
            <span className="ml-auto text-xs text-slate-400">{newsSignals.length} signaux</span>
          </div>
          <div className="px-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Chargement...</p>
            ) : newsSignals.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Aucune actualite sectorielle detectee.</p>
            ) : (
              newsSignals.map((s) => <SignalRow key={s.id} signal={s} />)
            )}
          </div>
        </div>
      </div>

      {/* RSS Sources config */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">📡 Sources RSS configurees</h2>
          <p className="text-xs text-slate-500 mt-1">Activez ou desactivez les sources surveillees par l'agent</p>
        </div>
        <div className="divide-y divide-slate-100">
          {rssSources.map((src, idx) => (
            <div key={src.name} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{src.name}</p>
                <p className="text-xs text-slate-400">{src.url}</p>
              </div>
              <button
                onClick={() => toggleSource(idx)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${src.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${src.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                />
              </button>
              <span className={`text-xs font-medium w-16 text-right ${src.enabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                {src.enabled ? 'Actif' : 'Desactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
