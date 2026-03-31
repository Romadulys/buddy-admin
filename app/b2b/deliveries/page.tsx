import Link from 'next/link'
import {
  mockDeliveries,
  DELIVERY_STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/b2b-mock'

const DELIVERY_STEPS = ['confirmed', 'preparing', 'shipped', 'in_transit', 'delivered']

function getStepIndex(status: string): number {
  return DELIVERY_STEPS.indexOf(status)
}

export default function B2BDeliveriesPage() {
  const total = mockDeliveries.length
  const inTransit = mockDeliveries.filter((d) => d.status === 'in_transit').length
  const delivered = mockDeliveries.filter((d) => d.status === 'delivered').length
  const preparing = mockDeliveries.filter((d) => d.status === 'preparing').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livraisons B2B</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mockDeliveries.length} livraison{mockDeliveries.length > 1 ? 's' : ''} enregistrée{mockDeliveries.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total livraisons</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes périodes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">En transit</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{inTransit}</p>
          <p className="text-xs text-gray-400 mt-1">Acheminement en cours</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Livrées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{delivered}</p>
          <p className="text-xs text-gray-400 mt-1">Réceptionnées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">En préparation</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">{preparing}</p>
          <p className="text-xs text-gray-400 mt-1">En cours de préparation</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Toutes les livraisons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  N° Livraison
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Commande
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Transporteur
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  N° Suivi
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Expédié le
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Livré le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      href={`/b2b/orders/${delivery.order_id}?tab=livraison`}
                      className="font-mono font-semibold text-indigo-700 hover:underline"
                    >
                      {delivery.delivery_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/b2b/orders/${delivery.order_id}`}
                      className="font-mono text-gray-700 hover:text-indigo-600 hover:underline"
                    >
                      {delivery.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700">{delivery.client_name}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {delivery.carrier ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {delivery.tracking_number ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {delivery.tracking_number}
                        </span>
                        {delivery.tracking_url && (
                          <a
                            href={delivery.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-500 hover:text-indigo-700"
                            title="Suivre"
                          >
                            →
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        DELIVERY_STATUS_COLORS[delivery.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[delivery.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {delivery.shipped_at
                      ? new Date(delivery.shipped_at).toLocaleDateString('fr-FR')
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {delivery.delivered_at ? (
                      <span className="text-green-600 font-medium">
                        {new Date(delivery.delivered_at).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mockDeliveries.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🚚</p>
              <p className="font-medium">Aucune livraison</p>
              <p className="text-sm mt-1">Les livraisons apparaîtront ici une fois créées depuis une commande.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Timeline Legend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Étapes de livraison</h3>
        <div className="flex items-center gap-0">
          {[
            { key: 'preparing', label: 'En préparation', color: 'bg-yellow-500' },
            { key: 'shipped', label: 'Expédié', color: 'bg-orange-500' },
            { key: 'in_transit', label: 'En transit', color: 'bg-blue-500' },
            { key: 'delivered', label: 'Livré', color: 'bg-green-500' },
          ].map((step, index, arr) => (
            <div key={step.key} className="flex items-center">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                <span className="text-xs font-medium text-gray-600">{step.label}</span>
              </div>
              {index < arr.length - 1 && (
                <div className="w-8 h-px bg-gray-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
