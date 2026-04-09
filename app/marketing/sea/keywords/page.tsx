'use client'

import { useState, useEffect, useCallback } from 'react'

interface Campaign {
  id: string
  name: string
  type: string
}

interface AdGroup {
  id: string
  name: string
  campaign_id: string
}

interface Keyword {
  text: string
  match_type: 'exact' | 'phrase' | 'broad'
  cpc_max: number | null
  quality_score: number | null
}

const MATCH_STYLES: Record<string, string> = {
  exact: 'bg-green-100 text-green-700',
  phrase: 'bg-blue-100 text-blue-700',
  broad: 'bg-orange-100 text-orange-700',
}

const MATCH_LABELS: Record<string, string> = {
  exact: 'Exact',
  phrase: 'Expression',
  broad: 'Large',
}

function qualityScoreColor(score: number): string {
  if (score >= 7) return 'text-green-600'
  if (score >= 4) return 'text-yellow-600'
  return 'text-red-500'
}

export default function SEAKeywordsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [adGroups, setAdGroups] = useState<AdGroup[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedAdGroup, setSelectedAdGroup] = useState('')
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingAdGroups, setLoadingAdGroups] = useState(false)
  const [loadingKeywords, setLoadingKeywords] = useState(false)
  const [newNegative, setNewNegative] = useState('')

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true)
      try {
        const res = await fetch('/api/marketing/sea/campaigns')
        if (!res.ok) throw new Error('fetch error')
        const data = await res.json()
        setCampaigns(data.campaigns ?? data ?? [])
      } catch {
        setCampaigns([])
      } finally {
        setLoadingCampaigns(false)
      }
    }
    fetchCampaigns()
  }, [])

  // Fetch ad groups when campaign changes
  const fetchAdGroups = useCallback(async (campaignId: string) => {
    if (!campaignId) { setAdGroups([]); setSelectedAdGroup(''); return }
    setLoadingAdGroups(true)
    try {
      const res = await fetch(`/api/marketing/sea/campaigns/${campaignId}/adgroups`)
      if (!res.ok) throw new Error('fetch error')
      const data = await res.json()
      const groups = data.adgroups ?? data ?? []
      setAdGroups(groups)
      if (groups.length > 0) setSelectedAdGroup(groups[0].id)
    } catch {
      setAdGroups([])
    } finally {
      setLoadingAdGroups(false)
    }
  }, [])

  useEffect(() => {
    fetchAdGroups(selectedCampaign)
  }, [selectedCampaign, fetchAdGroups])

  // Fetch keywords when ad group changes
  useEffect(() => {
    if (!selectedAdGroup) { setKeywords([]); setNegativeKeywords([]); return }
    const fetchKeywords = async () => {
      setLoadingKeywords(true)
      try {
        const res = await fetch(`/api/marketing/sea/ads?adgroup_id=${selectedAdGroup}`)
        if (!res.ok) throw new Error('fetch error')
        const data = await res.json()
        setKeywords(data.keywords ?? [])
        setNegativeKeywords(data.negative_keywords ?? [])
      } catch {
        setKeywords([])
        setNegativeKeywords([])
      } finally {
        setLoadingKeywords(false)
      }
    }
    fetchKeywords()
  }, [selectedAdGroup])

  const handleAddNegative = async (e: React.FormEvent) => {
    e.preventDefault()
    const kw = newNegative.trim()
    if (!kw || !selectedAdGroup) return
    try {
      await fetch(`/api/marketing/sea/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adgroup_id: selectedAdGroup, type: 'negative_keyword', keyword: kw }),
      })
      setNegativeKeywords((prev) => [...prev, kw])
      setNewNegative('')
    } catch {
      // silent
    }
  }

  const handleDeleteNegative = async (kw: string) => {
    if (!selectedAdGroup) return
    try {
      await fetch(`/api/marketing/sea/ads`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adgroup_id: selectedAdGroup, type: 'negative_keyword', keyword: kw }),
      })
      setNegativeKeywords((prev) => prev.filter((k) => k !== kw))
    } catch {
      // silent
    }
  }

  const noCampaigns = !loadingCampaigns && campaigns.length === 0

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">🔑 Mots-cles Ads</h1>
        <p className="text-sm text-slate-500">Mots-cles payants par campagne et groupe d&apos;annonces</p>
      </div>

      {noCampaigns ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 font-medium">Creez d&apos;abord une campagne dans l&apos;onglet Campagnes</p>
          <p className="text-amber-600 text-sm mt-1">Les mots-cles sont organises par campagne et groupe d&apos;annonces.</p>
        </div>
      ) : (
        <>
          {/* Campaign + AdGroup selectors */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-slate-600 mb-1">Campagne</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={loadingCampaigns}
              >
                <option value="">-- Choisir une campagne --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCampaign && (
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-medium text-slate-600 mb-1">Groupe d&apos;annonces</label>
                <select
                  value={selectedAdGroup}
                  onChange={(e) => setSelectedAdGroup(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={loadingAdGroups}
                >
                  {loadingAdGroups ? (
                    <option>Chargement...</option>
                  ) : adGroups.length === 0 ? (
                    <option>Aucun groupe</option>
                  ) : (
                    adGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Keywords table */}
          {!selectedAdGroup ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 mb-6">
              Selectionnez une campagne et un groupe d&apos;annonces pour voir les mots-cles
            </div>
          ) : loadingKeywords ? (
            <div className="flex items-center justify-center h-32 text-slate-400 mb-6">Chargement...</div>
          ) : keywords.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 mb-6">
              Aucun mot-cle dans ce groupe d&apos;annonces
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Mot-cle</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Match Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">CPC Max</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Quality Score</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keywords.map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{kw.text}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-0.5 ${MATCH_STYLES[kw.match_type]}`}>
                          {MATCH_LABELS[kw.match_type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {kw.cpc_max != null ? `€${kw.cpc_max.toFixed(2)}` : <span className="text-slate-400">--</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {kw.quality_score != null ? (
                          <span className={`font-bold ${qualityScoreColor(kw.quality_score)}`}>
                            {kw.quality_score}/10
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50">
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Negative keywords section */}
          {selectedAdGroup && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Mots-cles negatifs</h2>
              {negativeKeywords.length === 0 ? (
                <p className="text-xs text-slate-400 mb-3">Aucun mot-cle negatif defini</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {negativeKeywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
                      -{kw}
                      <button
                        onClick={() => handleDeleteNegative(kw)}
                        className="hover:text-red-900 transition-colors"
                        aria-label={`Supprimer ${kw}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddNegative} className="flex gap-2">
                <input
                  type="text"
                  value={newNegative}
                  onChange={(e) => setNewNegative(e.target.value)}
                  placeholder="Ajouter un mot-cle negatif..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ajouter
                </button>
              </form>
            </div>
          )}

          {/* SEO <-> SEA link info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex gap-3">
            <span className="text-2xl flex-shrink-0">🔗</span>
            <div>
              <h3 className="text-sm font-bold text-indigo-900 mb-1">Lien SEO ↔ SEA</h3>
              <p className="text-sm text-indigo-700">
                Les agents croiseront automatiquement les donnees SEO et SEA pour optimiser vos depenses.
                Les mots-cles bien positionnes organiquement peuvent reduire les encheres payantes.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
