'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import SupportClient from './SupportClient'
import SOSAlerts from './SOSAlerts'
import ChatInbox from './ChatInbox'
import EmailInbox from './EmailInbox'
import EmailDashboard from './EmailDashboard'

const MOCK_TICKETS = [
  {
    id: 'TKT-001',
    email: 'marie.dupont@gmail.com',
    subject: 'Mon Buddy Mini ne se connecte plus au réseau',
    status: 'Ouvert',
    priority: 'Urgent',
    date: '2026-03-30T09:23:00',
    message: 'Bonjour, depuis ce matin mon appareil est hors ligne. J\'ai redémarré plusieurs fois sans succès. Merci de m\'aider.',
  },
  {
    id: 'TKT-002',
    email: 'paul.martin@outlook.fr',
    subject: 'Comment changer mon abonnement vers Pro ?',
    status: 'Résolu',
    priority: 'Normal',
    date: '2026-03-29T14:45:00',
    message: 'Je voudrais passer du plan Basic au plan Pro. Comment faire ?',
  },
  {
    id: 'TKT-003',
    email: 'camille.bernard@yahoo.fr',
    subject: 'Problème de notification de géofence',
    status: 'En cours',
    priority: 'Normal',
    date: '2026-03-29T11:10:00',
    message: 'Je ne reçois plus les alertes quand mon enfant sort de la zone définie.',
  },
  {
    id: 'TKT-004',
    email: 'lucas.petit@gmail.com',
    subject: 'Remboursement demandé - achat en double',
    status: 'En cours',
    priority: 'Urgent',
    date: '2026-03-28T16:30:00',
    message: 'J\'ai été débité deux fois pour le même abonnement ce mois. Merci de corriger.',
  },
  {
    id: 'TKT-005',
    email: 'sophie.leroy@gmail.com',
    subject: 'Mise à jour de l\'application',
    status: 'Résolu',
    priority: 'Faible',
    date: '2026-03-27T10:00:00',
    message: 'Quand sera disponible la prochaine mise à jour de l\'app ?',
  },
  {
    id: 'TKT-006',
    email: 'thomas.morel@hotmail.fr',
    subject: 'Batterie qui se décharge trop vite',
    status: 'Ouvert',
    priority: 'Normal',
    date: '2026-03-31T08:15:00',
    message: 'La batterie de mon Buddy Big dure moins d\'une journée maintenant.',
  },
]

type Tab = 'inbox' | 'messagerie' | 'tickets' | 'sos'

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inbox')
  const [showDashboard, setShowDashboard] = useState(false)

  const openCount = MOCK_TICKETS.filter((t) => t.status === 'Ouvert').length
  const inProgressCount = MOCK_TICKETS.filter((t) => t.status === 'En cours').length
  const resolvedCount = MOCK_TICKETS.filter((t) => t.status === 'Résolu').length
  const urgentCount = MOCK_TICKETS.filter((t) => t.priority === 'Urgent').length

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inbox',      label: 'Inbox',      icon: '📧' },
    { key: 'messagerie', label: 'Messagerie', icon: '💬' },
    { key: 'tickets',    label: 'Tickets',    icon: '🎫' },
    { key: 'sos',        label: 'SOS',        icon: '⚠️' },
  ]

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_TICKETS.length} tickets · messagerie live</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 font-medium text-blue-700">
          <span>🚀</span>
          Email Intelligence Hub — Phase 1
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ouverts',  value: openCount,       color: 'bg-orange-50 text-orange-600 border-orange-200', icon: '📬' },
          { label: 'En cours', value: inProgressCount,  color: 'bg-blue-50 text-blue-600 border-blue-200',       icon: '🔄' },
          { label: 'Résolus',  value: resolvedCount,   color: 'bg-green-50 text-green-600 border-green-200',     icon: '✅' },
          { label: 'Urgents',  value: urgentCount,     color: 'bg-red-50 text-red-600 border-red-200',           icon: '🚨' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <span>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'inbox' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {showDashboard ? 'Dashboard Analytics' : 'Inbox'}
            </h2>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {showDashboard ? '← Retour' : '📊 Dashboard'}
            </button>
          </div>
          {showDashboard ? <EmailDashboard /> : <EmailInbox />}
        </section>
      )}

      {activeTab === 'messagerie' && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Messagerie live</h2>
          <ChatInbox />
        </section>
      )}

      {activeTab === 'tickets' && (
        <section>
          <SupportClient tickets={MOCK_TICKETS} />
        </section>
      )}

      {activeTab === 'sos' && (
        <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Alertes SOS</h2>
          <SOSAlerts />
        </section>
      )}
    </div>
  )
}
