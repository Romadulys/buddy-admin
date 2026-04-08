'use client'

import { useState, useMemo } from 'react'
import StatsCard from '@/components/StatsCard'
import { EmailCard } from '@/components/EmailCard'
import EmailPanel from './EmailPanel'
import {
  Email,
  mockEmails,
  getInboxStats,
  STATUT_LABELS,
  SENTIMENT_CONFIG,
  CATEGORIE_LABELS,
  URGENCE_CONFIG,
  TEAM_MEMBERS,
  EmailStatut,
  Sentiment,
  EmailCategorie,
  Urgence,
} from '@/lib/email-mock'

export default function EmailInbox() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  // Filter states
  const [filterStatut, setFilterStatut] = useState<EmailStatut | ''>('')
  const [filterSentiment, setFilterSentiment] = useState<Sentiment | ''>('')
  const [filterCategorie, setFilterCategorie] = useState<EmailCategorie | ''>('')
  const [filterUrgence, setFilterUrgence] = useState<Urgence | ''>('')
  const [filterAssigne, setFilterAssigne] = useState<string>('')
  const [filterDestinataire, setFilterDestinataire] = useState<string>('')

  // Filtered and sorted emails
  const filteredEmails = useMemo(() => {
    let result = [...emails]

    if (filterStatut) {
      result = result.filter((e) => e.statut === filterStatut)
    }
    if (filterSentiment) {
      result = result.filter((e) => e.ai_sentiment === filterSentiment)
    }
    if (filterCategorie) {
      result = result.filter((e) => e.ai_categorie === filterCategorie)
    }
    if (filterUrgence) {
      result = result.filter((e) => e.ai_urgence === filterUrgence)
    }
    if (filterAssigne) {
      result = result.filter((e) => e.assigne_a === filterAssigne)
    }
    if (filterDestinataire) {
      result = result.filter((e) => e.to_email.startsWith(filterDestinataire))
    }

    // Sort by ai_priorite descending
    result.sort((a, b) => b.ai_priorite - a.ai_priorite)

    return result
  }, [
    emails,
    filterStatut,
    filterSentiment,
    filterCategorie,
    filterUrgence,
    filterAssigne,
    filterDestinataire,
  ])

  // Get stats
  const stats = getInboxStats()
  const newToday = emails.filter(
    (e) =>
      e.statut === 'nouveau' &&
      new Date(e.received_at).toDateString() ===
        new Date().toDateString()
  ).length
  const pending = emails.filter((e) => e.statut === 'en_attente').length
  const avgResponseTime = '2.3h' // Mock value
  const avgSentiment = (
    emails.reduce((sum, e) => {
      const sentiments: Record<Sentiment, number> = {
        positif: 5,
        neutre: 3,
        negatif: 1,
        urgent: 0,
      }
      return sum + sentiments[e.ai_sentiment]
    }, 0) / emails.length
  ).toFixed(1)

  // Handlers
  function handleUpdate(id: string, updates: Partial<Email>) {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  function handleArchive(id: string) {
    handleUpdate(id, { statut: 'archive' })
    setSelectedEmail(null)
  }

  function handleSelectEmail(email: Email) {
    setSelectedEmail(email)
  }

  function handleClosePanel() {
    setSelectedEmail(null)
  }

  // Extract unique destinataire prefixes
  const destinatairePrefixes = Array.from(
    new Set(emails.map((e) => e.to_email.split('@')[0]))
  ).sort()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Inbox</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and analyze incoming emails</p>
      </div>

      {/* Stats Cards - 2x2 grid on mobile, 4 columns on xl */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Nouveaux aujourd'hui"
          value={newToday}
          icon="📩"
          color="orange"
        />
        <StatsCard
          title="En attente"
          value={pending}
          icon="⏳"
          color={pending > 5 ? 'red' : 'blue'}
        />
        <StatsCard
          title="Temps de réponse"
          value={avgResponseTime}
          icon="⚡"
          color="green"
        />
        <StatsCard
          title="Sentiment moyen"
          value={avgSentiment}
          icon="📊"
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as EmailStatut | '')}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Statut</option>
          {Object.entries(STATUT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value as Sentiment | '')}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Sentiment</option>
          {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.emoji} {config.label}
            </option>
          ))}
        </select>

        <select
          value={filterCategorie}
          onChange={(e) =>
            setFilterCategorie(e.target.value as EmailCategorie | '')
          }
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Catégorie</option>
          {Object.entries(CATEGORIE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filterUrgence}
          onChange={(e) => setFilterUrgence(e.target.value as Urgence | '')}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Urgence</option>
          {Object.entries(URGENCE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.emoji} {config.label}
            </option>
          ))}
        </select>

        <select
          value={filterAssigne}
          onChange={(e) => setFilterAssigne(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Membre</option>
          {TEAM_MEMBERS.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>

        <select
          value={filterDestinataire}
          onChange={(e) => setFilterDestinataire(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Adresse</option>
          {destinatairePrefixes.map((prefix) => (
            <option key={prefix} value={prefix}>
              {prefix}@
            </option>
          ))}
        </select>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl mb-2">📭</span>
            <p className="text-gray-500 text-sm">Aucun email trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={handleSelectEmail}
                isSelected={selectedEmail?.id === email.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Email Panel */}
      {selectedEmail && (
        <EmailPanel
          email={selectedEmail}
          onClose={handleClosePanel}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
        />
      )}
    </div>
  )
}
