'use client'

import Link from 'next/link'
import {
  mockB2BClients,
  mockOrders,
  formatEur,
  STATUS_LABELS,
} from '@/lib/b2b-mock'

export default function B2BClientsPage() {
  // Compute per-client stats
  const clientStats = mockB2BClients.map((client) => {
    const orders = mockOrders.filter((o) => o.client_id === client.id)
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const activeOrders = orders.filter(
      (o) => !['delivered', 'cancelled'].includes(o.status)
    ).length
    return { ...client, orders, totalRevenue, activeOrders }
  })

  const totalCA = clientStats.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalActiveOrders = clientStats.reduce((sum, c) => sum + c.activeOrders, 0)
  const totalOrders = mockOrders.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients B2B</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mockB2BClients.length} partenaires distributeurs &amp; revendeurs
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          onClick={() => alert('Fonctionnalité à venir')}
        >
          <span>+</span>
          Nouveau client
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total clients</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{mockB2BClients.length}</p>
          <p className="text-xs text-gray-400 mt-1">Partenaires actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total commandes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes périodes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">CA total</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatEur(totalCA)}</p>
          <p className="text-xs text-gray-400 mt-1">TTC cumulé</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Commandes en cours</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{totalActiveOrders}</p>
          <p className="text-xs text-gray-400 mt-1">Non livrées</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Liste des partenaires</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Entreprise
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Ville
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SIRET
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nb commandes
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  CA total TTC
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientStats.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                        {client.company_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{client.company_name}</p>
                        <p className="text-xs text-gray-400">
                          Client depuis{' '}
                          {new Date(client.created_at).toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-700">{client.contact_name}</p>
                    <p className="text-xs text-gray-400">{client.contact_email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{client.city}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {client.siret}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-gray-900">{client.orders.length}</span>
                    {client.activeOrders > 0 && (
                      <span className="ml-1.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                        {client.activeOrders} en cours
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-indigo-600">{formatEur(client.totalRevenue)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/b2b/orders?client=${client.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Voir commandes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mockB2BClients.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🏢</p>
              <p className="font-medium">Aucun client B2B</p>
              <p className="text-sm mt-1">Ajoutez votre premier partenaire distributeur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
