'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StatsCard from '@/components/StatsCard'
import PipelineBoard from '@/components/PipelineBoard'
import ProspectPanel from '@/components/ProspectPanel'
import {
  Prospect,
  ProspectStatut,
  mockProspects,
  formatEur,
  TEAM_MEMBERS,
  SOURCE_LABELS,
  TYPE_LABELS,
} from '@/lib/pipeline-mock'
import { mockB2BClients, B2BClient } from '@/lib/b2b-mock'

export default function PipelinePage() {
  const router = useRouter()

  const [prospects, setProspects] = useState<Prospect[]>([...mockProspects])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showLost, setShowLost] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState<Prospect | null>(null)
  const [filterAssigne, setFilterAssigne] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterType, setFilterType] = useState('')

  // ─── Derived stats ────────────────────────────────────────────
  const activeProspects = prospects.filter((p) => p.statut !== 'perdu' && p.statut !== 'gagne')
  const totalPipeline = activeProspects.reduce((sum, p) => sum + p.montant_estime, 0)

  const gagnes = prospects.filter((p) => p.statut === 'gagne').length
  const perdus = prospects.filter((p) => p.statut === 'perdu').length
  const closes = gagnes + perdus
  const tauxConversion = closes > 0 ? Math.round((gagnes / closes) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const relancesAujourdhui = activeProspects.filter(
    (p) => p.date_relance <= today
  ).length

  // ─── Filtered prospects ───────────────────────────────────────
  const filteredProspects = prospects.filter((p) => {
    if (filterAssigne && p.assigne_a !== filterAssigne) return false
    if (filterSource && p.source !== filterSource) return false
    if (filterType && p.type !== filterType) return false
    return true
  })

  // ─── Handlers ─────────────────────────────────────────────────
  const handleStatutChange = useCallback(
    (id: string, newStatut: ProspectStatut) => {
      if (newStatut === 'gagne') {
        const prospect = prospects.find((p) => p.id === id)
        if (prospect) setShowConvertModal(prospect)
      } else {
        setProspects((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, statut: newStatut, updated_at: new Date().toISOString().split('T')[0] }
              : p
          )
        )
        setSelectedProspect((prev) =>
          prev && prev.id === id ? { ...prev, statut: newStatut } : prev
        )
      }
    },
    [prospects]
  )

  const handleUpdate = useCallback((id: string, updates: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updated_at: new Date().toISOString().split('T')[0] }
          : p
      )
    )
    setSelectedProspect((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev
    )
  }, [])

  const handleDelete = useCallback((id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id))
    setSelectedProspect((prev) => (prev && prev.id === id ? null : prev))
  }, [])

  const handleConvert = useCallback(
    (prospect: Prospect, createOrder: boolean) => {
      const newClient: B2BClient = {
        id: `from-pipeline-${prospect.id}`,
        company_name: prospect.entreprise,
        contact_name: prospect.contact_nom,
        contact_email: prospect.contact_email,
        contact_phone: prospect.contact_telephone,
        city: prospect.ville,
        country: 'France',
        siret: '',
        notes: `Converti depuis Pipeline le ${new Date().toLocaleDateString('fr-FR')}. Source: ${SOURCE_LABELS[prospect.source]}.`,
        created_at: new Date().toISOString().split('T')[0],
      }

      mockB2BClients.push(newClient)

      setProspects((prev) => prev.filter((p) => p.id !== prospect.id))
      setSelectedProspect(null)
      setShowConvertModal(null)

      if (createOrder) {
        router.push(`/b2b/orders/new?client=${newClient.id}`)
      }
    },
    [router]
  )

  const handleNewProspect = useCallback(() => {
    const newProspect: Prospect = {
      id: `p-${Date.now()}`,
      entreprise: 'Nouveau prospect',
      type: 'distributeur',
      type_structure: 'independant',
      enseigne_parente: null,
      ville: '',
      region: '',
      nb_points_de_vente: null,
      contact_nom: '',
      contact_email: '',
      contact_telephone: '',
      statut: 'identifie',
      source: 'autre',
      montant_estime: 0,
      prochaine_action: '',
      date_relance: new Date().toISOString().split('T')[0],
      raison_perte: null,
      assigne_a: TEAM_MEMBERS[0],
      notes: [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }
    setProspects((prev) => [newProspect, ...prev])
    setSelectedProspect(newProspect)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeProspects.length} prospects actifs &mdash; {formatEur(totalPipeline)} en pipeline
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          onClick={handleNewProspect}
        >
          <span>+</span>
          Nouveau prospect
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total prospects"
          value={activeProspects.length}
          subtitle="Prospects actifs"
          icon="🎯"
          color="indigo"
        />
        <StatsCard
          title="Valeur pipeline"
          value={formatEur(totalPipeline)}
          subtitle="Montant estimé actifs"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Taux de conversion"
          value={`${tauxConversion}%`}
          subtitle={closes > 0 ? `${gagnes} gagnés / ${closes} closés` : 'Aucun deal closé'}
          icon="📈"
          color="blue"
        />
        <StatsCard
          title="Relances aujourd'hui"
          value={relancesAujourdhui}
          subtitle="À contacter aujourd'hui"
          icon="🔔"
          color={relancesAujourdhui > 0 ? 'red' : 'orange'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterAssigne}
          onChange={(e) => setFilterAssigne(e.target.value)}
          className="text-sm rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tous les assignés</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="text-sm rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Toutes les sources</option>
          {(Object.entries(SOURCE_LABELS) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Tous les types</option>
          {(Object.entries(TYPE_LABELS) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLost}
            onChange={(e) => setShowLost(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
          />
          Afficher les perdus
        </label>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard
        prospects={filteredProspects}
        showLost={showLost}
        onCardClick={setSelectedProspect}
        onStatutChange={handleStatutChange}
      />

      {/* Prospect Panel */}
      {selectedProspect && (
        <ProspectPanel
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onUpdate={handleUpdate}
          onConvert={(prospect) => setShowConvertModal(prospect)}
          onDelete={handleDelete}
        />
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            aria-hidden="true"
            onClick={() => setShowConvertModal(null)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-base font-semibold text-gray-900">
                  Convertir en client B2B ?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">
                    {showConvertModal.entreprise}
                  </span>{' '}
                  va être ajouté dans Clients B2B
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleConvert(showConvertModal, true)}
                  className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Oui, créer une commande
                </button>
                <button
                  onClick={() => handleConvert(showConvertModal, false)}
                  className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Non, juste convertir
                </button>
                <button
                  onClick={() => setShowConvertModal(null)}
                  className="w-full px-4 py-2.5 rounded-lg text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
