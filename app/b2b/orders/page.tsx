import Link from 'next/link'
import {
  mockOrders,
  formatEur,
  ORDER_STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/b2b-mock'

const ALL_STATUSES = ['draft', 'confirmed', 'invoiced', 'shipped', 'delivered', 'cancelled'] as const

export default function B2BOrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; client?: string }
}) {
  const activeFilter = searchParams?.status ?? 'all'
  const clientFilter = searchParams?.client

  const filtered = mockOrders.filter((o) => {
    if (clientFilter && o.client_id !== clientFilter) return false
    if (activeFilter !== 'all' && o.status !== activeFilter) return false
    return true
  })

  const totalCA = mockOrders.reduce((s, o) => s + o.total, 0)
  const enAttente = mockOrders.filter((o) => ['confirmed', 'invoiced', 'shipped'].includes(o.status)).length
  const livrees = mockOrders.filter((o) => o.status === 'delivered').length

  const tabCounts: Record<string, number> = { all: mockOrders.length }
  ALL_STATUSES.forEach((s) => {
    tabCounts[s] = mockOrders.filter((o) => o.status === s).length
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes B2B</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mockOrders.length} commandes — {formatEur(totalCA)} de CA total
          </p>
        </div>
        <Link
          href="/b2b/orders/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>+</span>
          Nouvelle commande
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total commandes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{mockOrders.length}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes périodes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">En attente livraison</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{enAttente}</p>
          <p className="text-xs text-gray-400 mt-1">Confirmé, facturé ou expédié</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Livrées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{livrees}</p>
          <p className="text-xs text-gray-400 mt-1">Commandes clôturées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">CA total TTC</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatEur(totalCA)}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes commandes</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'draft', label: 'Brouillon' },
          { key: 'confirmed', label: 'Confirmé' },
          { key: 'invoiced', label: 'Facturé' },
          { key: 'shipped', label: 'Expédié' },
          { key: 'delivered', label: 'Livré' },
          { key: 'cancelled', label: 'Annulé' },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/b2b/orders?status=${tab.key}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeFilter === tab.key ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tabCounts[tab.key] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  N° Commande
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date commande
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Livraison prévue
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Montant TTC
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-semibold text-gray-900">{order.order_number}</span>
                    {order.invoice_number && (
                      <p className="text-xs text-gray-400 mt-0.5">{order.invoice_number}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-700">{order.client_name}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {new Date(order.order_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString('fr-FR')
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {order.total > 0 ? (
                      <span className="font-semibold text-gray-900">{formatEur(order.total)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/b2b/orders/${order.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Voir
                      </Link>
                      {order.invoice_number && (
                        <Link
                          href={`/b2b/orders/${order.id}?tab=facture`}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Facture
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium">Aucune commande</p>
              <p className="text-sm mt-1">
                {activeFilter !== 'all'
                  ? `Aucune commande avec le statut "${STATUS_LABELS[activeFilter]}".`
                  : 'Créez votre première commande B2B.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
