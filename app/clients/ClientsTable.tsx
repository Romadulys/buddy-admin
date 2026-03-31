'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  email: string
  created_at: string
  plan: string
  referrals: number
  provider: string
}

const PLANS = ['Free', 'Basic', 'Pro', 'Family']

const planColors: Record<string, string> = {
  Free: 'bg-gray-100 text-gray-600',
  Basic: 'bg-blue-100 text-blue-700',
  Pro: 'bg-indigo-100 text-indigo-700',
  Family: 'bg-purple-100 text-purple-700',
}

const providerIcons: Record<string, string> = {
  email: '✉️',
  google: '🔵',
  apple: '🍎',
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')

  const filtered = clients.filter((c) => {
    const matchSearch = c.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || c.plan === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les plans</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="text-xs text-gray-400 flex items-center px-1">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fournisseur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date inscription</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Parrainages</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((client, idx) => (
                  <tr
                    key={client.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                          {client.email[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-gray-700 font-medium text-xs">{client.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <span title={client.provider}>
                        {providerIcons[client.provider] || '🔑'} {client.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(client.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${planColors[client.plan] || 'bg-gray-100 text-gray-600'}`}>
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-medium">
                      {client.referrals > 0 ? (
                        <span className="flex items-center gap-1">
                          <span className="text-purple-500">🎁</span>
                          {client.referrals}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                      >
                        Voir détail →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
