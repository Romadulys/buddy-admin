import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 30 // refresh every 30s

type OrderItem = {
  id: string
  name: string
  label: string
  type: 'coque' | 'pack'
  qty: number
  price: number
}

type Order = {
  id: string
  created_at: string
  status: string
  customer_email: string | null
  customer_name: string | null
  items: OrderItem[]
  total_amount: number
  shipping_address: {
    line1?: string
    line2?: string
    city?: string
    postal_code?: string
    country?: string
  } | null
  notes: string | null
  source: string | null
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200',
  refunded:   'bg-zinc-100 text-zinc-500 border-zinc-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   '⏳ En attente',
  confirmed: '✅ Confirmée',
  shipped:   '📦 Expédiée',
  delivered: '🏠 Livrée',
  cancelled: '❌ Annulée',
  refunded:  '↩️ Remboursée',
}

async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as Order[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function shortId(id: string) {
  return id.split('-')[0].toUpperCase()
}

export default async function CommandesPage() {
  const orders = await getOrders()

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  const pending = orders.filter((o) => o.status === 'pending').length
  const shipped = orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} commande{orders.length !== 1 ? 's' : ''} · Synchronisé Supabase</p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>🗄️</span>
          Voir dans Supabase
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total commandes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes statuts confondus</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Chiffre d&apos;affaires</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalRevenue.toFixed(0)}€</p>
          <p className="text-xs text-gray-400 mt-1">Hors annulées / remboursées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">En attente</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">{pending}</p>
          <p className="text-xs text-gray-400 mt-1">À traiter</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Expédiées</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{shipped}</p>
          <p className="text-xs text-gray-400 mt-1">Expédiées ou livrées</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Toutes les commandes</h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-gray-600">Aucune commande pour l&apos;instant</p>
            <p className="text-sm mt-1">Les commandes passées sur buddy-web apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Articles</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {shortId(order.id)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700 text-xs">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{order.customer_name || '—'}</p>
                      <p className="text-xs text-gray-400">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        <div className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-xs text-gray-600">
                              {item.qty}× {item.name}
                              {item.type === 'pack' ? ' (Pack)' : ''}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-900">{Number(order.total_amount).toFixed(2)}€</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center">
        Pour modifier le statut d&apos;une commande, rendez-vous dans{' '}
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Supabase
        </a>
        . La gestion avancée des commandes arrive prochainement.
      </p>
    </div>
  )
}
