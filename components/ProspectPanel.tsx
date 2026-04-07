'use client'

import { useState } from 'react'
import {
  Prospect,
  ProspectNote,
  ProspectStatut,
  STATUT_LABELS,
  STATUT_COLORS,
  TYPE_LABELS,
  STRUCTURE_LABELS,
  SOURCE_LABELS,
  RAISON_PERTE_OPTIONS,
  TEAM_MEMBERS,
  formatEur,
} from '@/lib/pipeline-mock'

interface ProspectPanelProps {
  prospect: Prospect
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Prospect>) => void
  onConvert: (prospect: Prospect) => void
  onDelete: (id: string) => void
}

const STATUT_ORDER: ProspectStatut[] = ['identifie', 'contacte', 'demo_rdv', 'proposition', 'gagne', 'perdu']

export default function ProspectPanel({
  prospect,
  onClose,
  onUpdate,
  onConvert,
  onDelete,
}: ProspectPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [showLostModal, setShowLostModal] = useState(false)
  const [raisonPerte, setRaisonPerte] = useState(RAISON_PERTE_OPTIONS[0])

  function handleStatutChange(value: string) {
    const statut = value as ProspectStatut
    if (statut === 'gagne') {
      onConvert(prospect)
    } else if (statut === 'perdu') {
      setShowLostModal(true)
    } else {
      onUpdate(prospect.id, { statut })
    }
  }

  function handleAddNote() {
    const trimmed = newNote.trim()
    if (!trimmed) return

    const note: ProspectNote = {
      id: `n-${Date.now()}`,
      auteur: 'Romain',
      contenu: trimmed,
      date: new Date().toISOString().split('T')[0],
    }

    onUpdate(prospect.id, { notes: [note, ...prospect.notes] })
    setNewNote('')
  }

  function handleConfirmLost() {
    onUpdate(prospect.id, { statut: 'perdu', raison_perte: raisonPerte })
    setShowLostModal(false)
    onClose()
  }

  function handleMarkGagne() {
    onConvert(prospect)
  }

  function handleMarkPerdu() {
    setShowLostModal(true)
  }

  function handleDelete() {
    if (confirm(`Supprimer le prospect "${prospect.entreprise}" ?`)) {
      onDelete(prospect.id)
      onClose()
    }
  }

  const sortedNotes = [...prospect.notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {prospect.entreprise}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Statut select */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Statut
            </label>
            <select
              value={prospect.statut}
              onChange={(e) => handleStatutChange(e.target.value)}
              className={`w-full text-sm font-medium rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${STATUT_COLORS[prospect.statut]}`}
            >
              {STATUT_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Infos entreprise */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Infos entreprise
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Type</p>
                <p className="text-sm text-gray-800">{TYPE_LABELS[prospect.type]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Structure</p>
                <p className="text-sm text-gray-800">{STRUCTURE_LABELS[prospect.type_structure]}</p>
              </div>
              {prospect.enseigne_parente && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Enseigne parente</p>
                  <p className="text-sm text-gray-800">{prospect.enseigne_parente}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Ville</p>
                <p className="text-sm text-gray-800">{prospect.ville}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Région</p>
                <p className="text-sm text-gray-800">{prospect.region}</p>
              </div>
              {prospect.nb_points_de_vente != null && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Points de vente</p>
                  <p className="text-sm text-gray-800">{prospect.nb_points_de_vente}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Source</p>
                <p className="text-sm text-gray-800">{SOURCE_LABELS[prospect.source]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Montant estimé</p>
                <p className="text-sm font-medium text-gray-800">{formatEur(prospect.montant_estime)}</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nom</p>
                <p className="text-sm text-gray-800">{prospect.contact_nom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <a
                  href={`mailto:${prospect.contact_email}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {prospect.contact_email}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
                <a
                  href={`tel:${prospect.contact_telephone}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {prospect.contact_telephone}
                </a>
              </div>
            </div>
          </div>

          {/* Suivi */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Suivi
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assigné à</label>
                <select
                  value={prospect.assigne_a}
                  onChange={(e) => onUpdate(prospect.id, { assigne_a: e.target.value })}
                  className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Prochaine action</label>
                <input
                  type="text"
                  value={prospect.prochaine_action}
                  onChange={(e) => onUpdate(prospect.id, { prochaine_action: e.target.value })}
                  className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date de relance</label>
                <input
                  type="date"
                  value={prospect.date_relance}
                  onChange={(e) => onUpdate(prospect.id, { date_relance: e.target.value })}
                  className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Notes
            </h3>

            {/* Add note input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Ajouter une note..."
                className="flex-1 text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Ajouter note"
              >
                +
              </button>
            </div>

            {/* Notes list */}
            {sortedNotes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucune note</p>
            ) : (
              <ul className="space-y-3">
                {sortedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-indigo-600">{note.auteur}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(note.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{note.contenu}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleMarkGagne}
            className="flex-1 px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Marquer Gagné
          </button>
          <button
            onClick={handleMarkPerdu}
            className="flex-1 px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Marquer Perdu
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Supprimer le prospect"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Lost modal */}
      {showLostModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" aria-hidden="true" />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Marquer comme perdu
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Sélectionnez la raison de la perte pour{' '}
                <span className="font-medium text-gray-700">{prospect.entreprise}</span>.
              </p>

              <fieldset className="space-y-2 mb-5">
                {RAISON_PERTE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="raison_perte"
                      value={option}
                      checked={raisonPerte === option}
                      onChange={() => setRaisonPerte(option)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-400"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {option}
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLostModal(false)}
                  className="flex-1 px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmLost}
                  className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
