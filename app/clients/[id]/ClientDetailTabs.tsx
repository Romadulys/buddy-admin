'use client'

import { useState } from 'react'

interface ClientData {
  user: {
    id: string
    email?: string
    created_at: string
    last_sign_in_at?: string
    app_metadata?: Record<string, unknown>
    user_metadata?: Record<string, unknown>
    email_confirmed_at?: string
  }
  referralCode: {
    id: string
    code: string
    user_id: string
    created_at: string
  } | null
  referralUses: {
    id: string
    used_by_user_id: string
    created_at: string
  }[]
}

const tabs = [
  { id: 'infos', label: 'Infos', icon: '👤' },
  { id: 'abonnement', label: 'Abonnement', icon: '💳' },
  { id: 'parrainage', label: 'Parrainage', icon: '🎁' },
  { id: 'support', label: 'Support', icon: '🎧' },
]

export default function ClientDetailTabs({ data }: { data: ClientData }) {
  const [activeTab, setActiveTab] = useState('infos')
  const { user, referralCode, referralUses } = data

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-gray-100 flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* INFOS tab */}
        {activeTab === 'infos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations du compte</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'User ID', value: user.id, mono: true },
                { label: 'Email', value: user.email ?? '—' },
                {
                  label: 'Date d\'inscription',
                  value: new Date(user.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }),
                },
                {
                  label: 'Dernière connexion',
                  value: user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : 'Jamais',
                },
                {
                  label: 'Fournisseur',
                  value: String(user.app_metadata?.provider ?? 'email'),
                },
                {
                  label: 'Email vérifié',
                  value: user.email_confirmed_at ? '✅ Oui' : '❌ Non',
                },
              ].map((field) => (
                <div key={field.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{field.label}</p>
                  <p className={`text-sm text-gray-800 ${field.mono ? 'font-mono text-xs break-all' : 'font-medium'}`}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABONNEMENT tab */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-4">
              <span>⚠️</span>
              <span>Données Stripe en cours d&apos;intégration — informations simulées</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Plan actif', value: 'Free', badge: 'bg-gray-100 text-gray-600' },
                { label: 'Statut', value: 'Actif', badge: 'bg-green-100 text-green-700' },
                { label: 'Date de début', value: new Date(user.created_at).toLocaleDateString('fr-FR') },
                { label: 'Prochain renouvellement', value: '—' },
                { label: 'Stripe Customer ID', value: 'cus_placeholder_' + user.id.slice(0, 8) },
                { label: 'Montant mensuel', value: '€0 (Free)' },
              ].map((field) => (
                <div key={field.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{field.label}</p>
                  {field.badge ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${field.badge}`}>
                      {field.value}
                    </span>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 font-mono">{field.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARRAINAGE tab */}
        {activeTab === 'parrainage' && (
          <div className="space-y-4">
            {referralCode ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">Code de parrainage</p>
                    <p className="text-xl font-bold text-indigo-700 font-mono">{referralCode.code}</p>
                    <p className="text-xs text-indigo-400 mt-0.5">
                      Créé le {new Date(referralCode.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-indigo-700">{referralUses.length}</p>
                    <p className="text-xs text-indigo-400">utilisation{referralUses.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {referralUses.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Personnes parrainées</h4>
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">User ID</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {referralUses.map((use) => (
                            <tr key={use.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{use.used_by_user_id}</td>
                              <td className="px-4 py-2.5 text-xs text-gray-500">
                                {new Date(use.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune utilisation pour l&apos;instant</p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-gray-500 text-sm">Cet utilisateur n&apos;a pas encore de code de parrainage</p>
              </div>
            )}
          </div>
        )}

        {/* SUPPORT tab */}
        {activeTab === 'support' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 mb-4">
              <span>🚀</span>
              <span>Historique support — intégration Zendesk/Intercom en cours</span>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎧</div>
              <p className="text-gray-500 text-sm">Aucun ticket de support pour cet utilisateur</p>
              <p className="text-gray-400 text-xs mt-1">L&apos;historique apparaîtra ici une fois le système connecté</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
