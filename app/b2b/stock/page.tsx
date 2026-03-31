import Link from 'next/link'
import {
  mockStock,
  mockSupplierOrders,
  getStockStats,
  getStockLevel,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUS_COLORS,
  SUPPLIER_STATUS_ICONS,
} from '@/lib/stock-mock'
import { formatEur } from '@/lib/b2b-mock'
import StockPageClient from './StockPageClient'

export default function StockPage() {
  const { totalAvailable, totalReserved, totalNet, nextDelivery, nextDeliveryUnits } =
    getStockStats()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock &amp; Arrivages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vue d&apos;ensemble des stocks et commandes fournisseurs
          </p>
        </div>
        <StockPageClient />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Stock disponible total
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalAvailable.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Toutes références</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Stock réservé
          </p>
          <p className="text-3xl font-bold text-orange-500 mt-1">
            {totalReserved.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Commandes B2B confirmées</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Disponible net
          </p>
          <p
            className={`text-3xl font-bold mt-1 ${
              totalNet < 500 ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {totalNet.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Disponible − réservé</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Prochaine livraison
          </p>
          {nextDelivery ? (
            <>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {new Date(nextDelivery.estimated_arrival).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                +{nextDeliveryUnits.toLocaleString('fr-FR')} unités
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Aucun arrivage planifié</p>
          )}
        </div>
      </div>

      {/* Stock par produit */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Stock par produit</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Produit
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Stock actuel
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Réservé
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Disponible net
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Prix achat
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Prix vente
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">
                    Niveau / Prochaine arrivée
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockStock.map((item) => {
                  const level = getStockLevel(item)
                  const net = item.current_stock - item.reserved_stock
                  const barColor =
                    level === 'high'
                      ? 'bg-green-500'
                      : level === 'medium'
                      ? 'bg-orange-400'
                      : 'bg-red-500'
                  const barWidth = Math.min(100, (net / 1500) * 100)

                  // Find next supplier order for this product
                  const nextArrival = mockSupplierOrders
                    .filter(
                      (so) =>
                        so.product_name === item.product_name && so.status !== 'livre'
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.estimated_arrival).getTime() -
                        new Date(b.estimated_arrival).getTime()
                    )[0]

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-900">
                        {item.current_stock.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-4 text-right text-orange-600 font-medium">
                        {item.reserved_stock.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-bold ${
                            level === 'high'
                              ? 'text-green-600'
                              : level === 'medium'
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}
                        >
                          {net.toLocaleString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-gray-600">
                        {formatEur(item.purchase_price)}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-600">
                        {formatEur(item.sale_price)}
                      </td>
                      <td className="px-5 py-4">
                        {/* Stock bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${barColor}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        {nextArrival ? (
                          <p className="text-xs text-gray-400">
                            +{nextArrival.quantity.toLocaleString('fr-FR')} le{' '}
                            {new Date(nextArrival.estimated_arrival).toLocaleDateString(
                              'fr-FR',
                              { day: 'numeric', month: 'short' }
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-300">Aucun arrivage prévu</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/b2b/stock/${item.id}`}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Détail
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Commandes fournisseurs */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Commandes fournisseurs — Arrivages Chine
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    N° Commande
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fournisseur
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Produit
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quantité
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Coût total
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date commande
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Arrivée estimée
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockSupplierOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-semibold text-gray-900 text-xs">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-700 text-xs">{order.supplier}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">{order.product_name}</span>
                      {order.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                          {order.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">
                      {order.quantity.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">
                      {formatEur(order.total_cost)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(order.order_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {new Date(order.estimated_arrival).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          SUPPLIER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span>{SUPPLIER_STATUS_ICONS[order.status]}</span>
                        {SUPPLIER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Timeline visuelle */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Calendrier des arrivages</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          {mockSupplierOrders
            .filter((o) => o.status !== 'livre')
            .sort(
              (a, b) =>
                new Date(a.estimated_arrival).getTime() -
                new Date(b.estimated_arrival).getTime()
            )
            .map((order) => {
              const daysUntil = Math.ceil(
                (new Date(order.estimated_arrival).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
              return (
                <div
                  key={order.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                    {SUPPLIER_STATUS_ICONS[order.status]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{order.order_number}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          SUPPLIER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {SUPPLIER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {order.product_name} — {order.quantity.toLocaleString('fr-FR')} unités
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.supplier}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(order.estimated_arrival).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p
                      className={`text-xs mt-0.5 font-medium ${
                        daysUntil <= 14
                          ? 'text-orange-500'
                          : daysUntil <= 30
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {daysUntil > 0 ? `dans ${daysUntil}j` : 'Aujourd\'hui'}
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
