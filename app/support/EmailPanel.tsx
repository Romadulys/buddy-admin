'use client'

import { useState } from 'react'
import { SentimentBadge } from '@/components/SentimentBadge'
import {
  Email,
  URGENCE_CONFIG,
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  TEAM_MEMBERS,
  getPrioritieColor,
} from '@/lib/email-mock'

interface EmailPanelProps {
  email: Email
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Email>) => void
  onArchive: (id: string) => void
}

export default function EmailPanel({
  email,
  onClose,
  onUpdate,
  onArchive,
}: EmailPanelProps) {
  const [editableReply, setEditableReply] = useState(email.ai_reponse_suggeree)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleSendReply() {
    onUpdate(email.id, {
      statut: 'repondu',
      repondu_at: new Date().toISOString(),
      repondu_par: 'Romain',
    })
    onClose()
  }

  function handleArchive() {
    onArchive(email.id)
  }

  function handleCreateProspect() {
    // This would link to /b2b/pipeline with email data
    // For now, open modal or alert
    setIsModalOpen(true)
  }

  function confirmCreateProspect() {
    // TODO: Link to /b2b/pipeline with email data pre-filled
    setIsModalOpen(false)
    onClose()
  }

  const replyCharCount = editableReply.length
  const urgenceConfig = URGENCE_CONFIG[email.ai_urgence]
  const categorieLabel = CATEGORIE_LABELS[email.ai_categorie]
  const categorieColor = CATEGORIE_COLORS[email.ai_categorie]
  const prioriteColor = getPrioritieColor(email.ai_priorite)
  const isCommercial = email.ai_routage === 'commercial'

  // Format date to French locale
  const receivedDate = new Date(email.received_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {email.subject}
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
          {/* AI Analysis Section */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Analyse IA
            </h3>
            <div className="space-y-3">
              {/* Sentiment badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sentiment:</span>
                <SentimentBadge sentiment={email.ai_sentiment} size="md" />
              </div>

              {/* Urgence badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Urgence:</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium inline-flex items-center gap-1 ${urgenceConfig.color}`}>
                  <span>{urgenceConfig.emoji}</span>
                  {urgenceConfig.label}
                </span>
              </div>

              {/* Categorie badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Catégorie:</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${categorieColor}`}>
                  {categorieLabel}
                </span>
              </div>

              {/* Priorite score */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Priorité:</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${prioriteColor}`}>
                  {email.ai_priorite}%
                </span>
              </div>

              {/* Resume */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Résumé:</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-md p-3 border border-gray-100">
                  {email.ai_resume}
                </p>
              </div>

              {/* Mots cles */}
              {email.ai_mots_cles.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Mots-clés:</p>
                  <div className="flex flex-wrap gap-2">
                    {email.ai_mots_cles.map((motcle) => (
                      <span
                        key={motcle}
                        className="inline-flex px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100"
                      >
                        {motcle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mail Original Section */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Email original
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">De:</p>
                <p className="text-sm text-gray-800">
                  {email.from_name} ({email.from_email})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">À:</p>
                <p className="text-sm text-gray-800">{email.to_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date:</p>
                <p className="text-sm text-gray-800">{receivedDate}</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">Message:</p>
                <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {email.body_text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reponse Suggeree Section */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Réponse suggérée
            </h3>
            <div>
              <textarea
                value={editableReply}
                onChange={(e) => setEditableReply(e.target.value)}
                className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                rows={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                {replyCharCount} caractères
              </p>
            </div>
          </div>

          {/* Assign Section */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Assigné à
            </label>
            <select
              value={email.assigne_a || ''}
              onChange={(e) => onUpdate(email.id, { assigne_a: e.target.value || null })}
              className="w-full text-sm rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Non assigné</option>
              {TEAM_MEMBERS.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-200 flex-shrink-0 flex-wrap">
          <button
            onClick={handleSendReply}
            className="flex-1 px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Envoyer
          </button>
          <button
            onClick={handleArchive}
            className="flex-1 px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Archiver
          </button>
          {isCommercial && (
            <button
              onClick={handleCreateProspect}
              className="flex-1 px-3 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Créer prospect
            </button>
          )}
        </div>
      </div>

      {/* Create Prospect Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" aria-hidden="true" />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Créer un prospect B2B
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Créer un nouveau prospect B2B à partir de cet email commercial:
              </p>
              <p className="text-sm font-medium text-gray-800 mb-6 p-3 bg-gray-50 rounded-md border border-gray-100">
                {email.from_name} ({email.from_email})
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmCreateProspect}
                  className="flex-1 px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
