'use client'

import { useState } from 'react'
import { Proposal, ProposalStatus } from '@/lib/marketing/types'
import { StatusBadge, BlocBadge, BrandBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'

interface ProposalDetailProps {
  proposal: Proposal
  onStatusChange: (id: string, status: ProposalStatus, extra?: Record<string, unknown>) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProposalDetail({ proposal, onStatusChange }: ProposalDetailProps) {
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    onStatusChange(proposal.id, 'rejected', { rejection_reason: rejectionReason })
    setRejecting(false)
    setRejectionReason('')
  }

  const hasMetadata = proposal.metadata && Object.keys(proposal.metadata).length > 0
  const hasBrandDetails = proposal.brand_review_details && proposal.brand_review_details.length > 0

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 gap-6">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
            {proposal.source === 'agent' ? '🤖' : '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{proposal.title}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <BlocBadge bloc={proposal.bloc} />
              <StatusBadge status={proposal.status} />
              <PriorityBadge priority={proposal.priority} />
              <BrandBadge status={proposal.brand_review_status} />
            </div>
          </div>
        </div>

        {proposal.summary && (
          <p className="text-sm text-slate-600 leading-relaxed">{proposal.summary}</p>
        )}

        <div className="mt-3 text-xs text-slate-400">
          Source :{' '}
          <span className="font-medium text-slate-600">
            {proposal.source === 'agent' ? `Agent — ${proposal.agent_type ?? '?'}` : 'Humain'}
          </span>
          {' · '}
          Créé le <span className="font-medium text-slate-600">{formatDate(proposal.created_at)}</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Contenu</h3>
        <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap break-words">
          {JSON.stringify(proposal.content, null, 2)}
        </pre>
      </div>

      {/* Metadata */}
      {hasMetadata && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Métadonnées</h3>
          <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(proposal.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Brand review details */}
      {hasBrandDetails && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Revue de marque</h3>
          <div className="space-y-2">
            {proposal.brand_review_details.map((check, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  check.passed
                    ? 'bg-green-50 text-green-800'
                    : check.severity === 'warning'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <span className="flex-shrink-0">
                  {check.passed ? '✅' : check.severity === 'warning' ? '⚠️' : '❌'}
                </span>
                <div>
                  <p className="font-medium">{check.rule}</p>
                  {check.message && <p className="text-xs mt-0.5 opacity-80">{check.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection reason */}
      {proposal.rejection_reason && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Raison du rejet</h3>
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
            {proposal.rejection_reason}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        {proposal.status === 'pending_review' && (
          <div className="space-y-3">
            {rejecting ? (
              <div className="space-y-2">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Raison du rejet..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    Confirmer le rejet
                  </button>
                  <button
                    onClick={() => { setRejecting(false); setRejectionReason('') }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange(proposal.id, 'approved')}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  ✅ Approuver
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  ❌ Rejeter
                </button>
              </div>
            )}
          </div>
        )}

        {proposal.status === 'approved' && (
          <button
            onClick={() => onStatusChange(proposal.id, 'ready_to_publish')}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            📦 Marquer prêt
          </button>
        )}

        {proposal.status === 'ready_to_publish' && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(proposal.id, 'published')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              🚀 Publier
            </button>
            <button
              onClick={() => onStatusChange(proposal.id, 'pending_review')}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ↩️ Retour en révision
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
