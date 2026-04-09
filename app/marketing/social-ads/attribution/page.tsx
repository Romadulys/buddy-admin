'use client'

import { useState } from 'react'

type AttributionModel = 'last_click' | 'linear' | 'data_driven'

const UTM_EXAMPLES = [
  { param: 'utm_source', meta: 'facebook', tiktok: 'tiktok', google: 'google' },
  { param: 'utm_medium', meta: 'cpc', tiktok: 'video_paid', google: 'cpc' },
  { param: 'utm_campaign', meta: '{{campaign.name}}', tiktok: '{{campaign.name}}', google: '{{campaignname}}' },
  { param: 'utm_content', meta: '{{adset.name}}__{{ad.name}}', tiktok: '{{adgroup.name}}__{{ad.name}}', google: '{{adgroupname}}__{{creative}}' },
  { param: 'utm_term', meta: '{{placement}}', tiktok: '{{placement_type}}', google: '{{keyword}}' },
]

const ATTRIBUTION_MODELS: { value: AttributionModel; label: string; description: string }[] = [
  {
    value: 'last_click',
    label: 'Dernier clic',
    description: '100% du credit au dernier canal clique avant la conversion. Simple, mais ignore la contribution des canaux precedents.',
  },
  {
    value: 'linear',
    label: 'Lineaire',
    description: 'Credit distribue egalement entre tous les points de contact du parcours. Plus equitable pour les canaux de decouverte.',
  },
  {
    value: 'data_driven',
    label: 'Data-driven',
    description: 'Credit base sur la contribution statistique reelle de chaque canal. Necessite suffisamment de donnees de conversion.',
  },
]

export default function AttributionPage() {
  const [model, setModel] = useState<AttributionModel>('last_click')

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">🔀 Attribution cross-platform</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Quand un utilisateur voit une pub TikTok, clique sur une pub Meta, puis convertit via Google —
          qui obtient le credit ? Le probleme du multi-touch est au coeur de toute strategie paid.
        </p>
      </div>

      {/* Problem explanation */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">Le probleme du multi-touch</h3>
            <p className="text-sm text-orange-800 mb-3">
              Chaque plateforme pub (Meta, TikTok, Google) revendique 100% du credit pour ses conversions.
              Sans tracking UTM unifie et modele d&apos;attribution centralise, vous comptez la meme
              conversion 3 fois et surestimez massivement votre ROAS global.
            </p>
            <p className="text-sm text-orange-800">
              La solution : un UTM convention strict + tracking cote serveur (server-side) +
              fenetre d&apos;attribution unifiee.
            </p>
          </div>
        </div>
      </div>

      {/* UTM convention table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Convention UTM — generee automatiquement</h2>
          <span className="text-xs bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
            Auto par les agents
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          UTM tracking genere automatiquement par les agents lors de la creation des creatives.
          Aucune intervention manuelle requise.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 w-32">Parametre</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  <span className="flex items-center gap-1">📢 Meta</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  <span className="flex items-center gap-1">🎵 TikTok</span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  <span className="flex items-center gap-1">💰 Google</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {UTM_EXAMPLES.map((row) => (
                <tr key={row.param} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-semibold">{row.param}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.meta}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.tiktok}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.google}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attribution model selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Modele d&apos;attribution</h2>
        <div className="flex flex-col gap-3">
          {ATTRIBUTION_MODELS.map((m) => (
            <label
              key={m.value}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                model === m.value
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="attribution_model"
                value={m.value}
                checked={model === m.value}
                onChange={() => setModel(m.value)}
                className="mt-0.5 accent-indigo-600"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 text-sm">{m.label}</span>
                  {m.value === 'last_click' && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">defaut</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{m.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Deduplication info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">✅</span>
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Deduplication automatique</h3>
            <p className="text-sm text-green-800">
              UTM tracking genere automatiquement par les agents. Les conversions sont deduplicates
              via event ID unique envoye a chaque plateforme. Une conversion = un event ID =
              comptee une seule fois, quelle que soit la plateforme.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder journeys */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-2">Vue parcours multi-touch</h2>
        <p className="text-sm text-slate-400 italic">
          Vue parcours multi-touch disponible quand les campagnes sont actives et que
          les donnees de conversion sont collectees (minimum 30 jours, 100+ conversions).
        </p>
        <div className="mt-4 h-32 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
          <p className="text-sm text-slate-400">Graphe de parcours — bientot disponible</p>
        </div>
      </div>
    </div>
  )
}
