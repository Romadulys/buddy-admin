import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  mockStock,
  mockSupplierOrders,
  mockStockHistory,
  estimateDelivery,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUS_COLORS,
  SUPPLIER_STATUS_ICONS,
  getStockLevel,
} from '@/lib/stock-mock'
import { formatEur, mockOrders } from '@/lib/b2b-mock'

// Simple sparkline built from SVG — no chart dependency needed
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 200
  const h = 48
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 6) - 3
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-12"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function StockDetailPage({ params }: { params: { id: string } }) {
  const item = mockStock.find((s) => s.id === params.id)
  if (!item) notFound()

  const level = getStockLevel(item)
  const net = item.current_stock - item.reserved_stock
  const margin = item.sale_price - item.purchase_price
  const marginPct = ((margin / item.sale_price) * 100).toFixed(1)

  // Stock history for this product
  const history = mockStockHistory.filter((h) => h.stock_id === item.id)

  // Mock cumulative stock over time (last 12 months)
  const sparklineData = [
    item.current_stock + 3500,
    item.current_stock + 3100,
    item.current_stock + 2800,
    item.current_stock + 2400,
    item.current_stock + 2000,
    item.current_stock + 1700,
    item.current_stock + 1400,
    item.current_stock + 1100,
    item.current_stock + 800,
    item.current_stock + 500,
    item.current_stock + 200,
    item.current_stock,
  ]

  // B2B orders that include this product
  const relatedOrders = mockOrders.filter((o) =>
    o.items.some((i) => i.product_name === item.product_name)
  )

  // Supplier orders for this product
  const supplierOrders = mockSupplierOrders.filter(
    (so) => so.product_name === item.product_name
  )

  // Reorder suggestion
  const estimate =
    item.product_type === 'mini' || item.product_type === 'big'
      ? estimateDelivery(item.low_stock_threshold * 3, item.product_type as 'mini' | 'big')
      : null

  const statusBg =
    level === 'high' ? 'bg-green-50 border-green-200' : level === 'medium' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
  const statusText =
    level === 'high' ? 'text-green-700' : level === 'medium' ? 'text-orange-700' : 'text-red-700'
  const statusLabel =
    level === 'high' ? 'Stock suffisant' : level === 'medium' ? 'Stock modéré' : 'Stock faible !'

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/b2b/stock" className="hover:text-indigo-600 transition-colors">
          Stock &amp; Arrivages
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{item.product_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.product_name}</h1>
          <p className="text-sm font-mono text-gray-400 mt-0.5">{item.sku}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusBg} ${statusText}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Stock actuel', value: item.current_stock.toLocaleString('fr-FR'), sub: 'unités en entrepôt', color: 'text-gray-900' },
          { label: 'Réservé', value: item.reserved_stock.toLocaleString('fr-FR'), sub: 'commandes confirmées', color: 'text-orange-500' },
          { label: 'Net disponible', value: net.toLocaleString('fr-FR'), sub: 'prêt à l\'expédition', color: level === 'high' ? 'text-green-600' : level === 'medium' ? 'text-orange-600' : 'text-red-600' },
          { label: 'Marge unitaire', value: formatEur(margin), sub: `${marginPct}% sur prix vente`, color: 'text-indigo-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: sparkline + history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock evolution chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Évolution du stock</h2>
              <span className="text-xs text-gray-400">12 derniers mois</span>
            </div>
            <Sparkline data={sparklineData} />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Avr. 2025</span>
              <span>Mars 2026</span>
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Mouvements récents</h2>
            </div>
            {history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qté</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Référence</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-600">
                        {new Date(m.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            m.type === 'in'
                              ? 'bg-green-100 text-green-700'
                              : m.type === 'reserved'
                              ? 'bg-orange-100 text-orange-700'
                              : m.type === 'adjustment'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {m.type === 'in' ? 'Entrée' : m.type === 'out' ? 'Sortie' : m.type === 'reserved' ? 'Réservé' : 'Ajustement'}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${
                          m.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {m.quantity > 0 ? '+' : ''}{m.quantity.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{m.reference}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{m.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">Aucun mouvement enregistré</p>
              </div>
            )}
          </div>

          {/* Réservations clients B2B */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">
                Réservations clients B2B
              </h2>
            </div>
            {relatedOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commande</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qté</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {relatedOrders.map((order) => {
                    const line = order.items.find((i) => i.product_name === item.product_name)!
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <Link
                            href={`/b2b/orders/${order.id}`}
                            className="font-mono text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-700 font-medium">{order.client_name}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                          {line.quantity.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">
                          {formatEur(line.total_price)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'shipped' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.status === 'delivered' ? 'Livré' :
                             order.status === 'confirmed' ? 'Confirmé' :
                             order.status === 'shipped' ? 'Expédié' :
                             order.status === 'invoiced' ? 'Facturé' : order.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">Aucune réservation B2B pour ce produit</p>
              </div>
            )}
          </div>
        </div>

        {/* Right col: product info + supplier orders + reorder */}
        <div className="space-y-5">
          {/* Product info card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Informations produit</h2>
            {[
              { label: 'SKU', value: item.sku, mono: true },
              { label: 'Type', value: item.product_type },
              { label: 'Prix achat', value: formatEur(item.purchase_price) },
              { label: 'Prix vente', value: formatEur(item.sale_price) },
              { label: 'Marge', value: `${formatEur(margin)} (${marginPct}%)` },
              { label: 'Seuil alerte', value: `${item.low_stock_threshold} unités` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{row.label}</span>
                <span className={`text-sm font-medium text-gray-900 ${row.mono ? 'font-mono text-xs' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Supplier orders */}
          {supplierOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Historique fournisseur</h2>
              <div className="space-y-3">
                {supplierOrders.map((so) => (
                  <div key={so.id} className="p-3 rounded-lg bg-gray-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500">{so.order_number}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          SUPPLIER_STATUS_COLORS[so.status]
                        }`}
                      >
                        {SUPPLIER_STATUS_ICONS[so.status]}
                        {SUPPLIER_STATUS_LABELS[so.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">
                      <strong>{so.quantity.toLocaleString('fr-FR')} unités</strong> à {formatEur(so.unit_cost)}/u
                    </p>
                    <p className="text-xs text-gray-500">
                      Arrivée:{' '}
                      {new Date(so.estimated_arrival).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {so.notes && (
                      <p className="text-xs text-gray-400 italic">{so.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reorder suggestion */}
          {estimate && (
            <div
              className={`rounded-xl border p-5 ${
                estimate.canFulfill
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{estimate.canFulfill ? '✅' : '⚠️'}</span>
                <h2 className="text-sm font-semibold text-gray-900">
                  Suggestion de réappro
                </h2>
              </div>
              <p className="text-xs text-gray-600">{estimate.message}</p>
              {!estimate.canFulfill && (
                <Link
                  href="/b2b/stock"
                  className="mt-3 inline-block text-xs font-semibold text-red-700 hover:underline"
                >
                  Créer un arrivage fournisseur →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
