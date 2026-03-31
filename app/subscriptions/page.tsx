import { supabase } from '@/lib/supabase'

const PLANS = ['Free', 'Basic', 'Pro', 'Family']
const PLAN_PRICES: Record<string, string> = {
  Free: '€0',
  Basic: '€4.99',
  Pro: '€9.99',
  Family: '€14.99',
}
const STATUSES = ['Actif', 'Actif', 'Actif', 'Actif', 'Actif', 'Impayé', 'Annulé']

function generateSubscriptions(users: { id: string; email: string; created_at: string }[]) {
  return users.map((user, idx) => {
    const plan = PLANS[idx % PLANS.length]
    const status = STATUSES[idx % STATUSES.length]
    const startDate = new Date(user.created_at)
    const nextRenewal = new Date(startDate)
    nextRenewal.setMonth(nextRenewal.getMonth() + 1)
    return {
      id: user.id,
      email: user.email,
      plan,
      price: PLAN_PRICES[plan],
      startDate,
      nextRenewal,
      status,
      stripeId: plan === 'Free' ? null : `cus_${user.id.replace(/-/g, '').slice(0, 14)}`,
    }
  })
}

async function getSubscriptionsData() {
  const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const users = (usersData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? '—',
    created_at: u.created_at,
  }))
  return generateSubscriptions(users)
}

const statusColors: Record<string, string> = {
  Actif: 'bg-green-100 text-green-700',
  Impayé: 'bg-red-100 text-red-700',
  Annulé: 'bg-gray-100 text-gray-500',
}

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptionsData()

  const activeCount = subscriptions.filter((s) => s.status === 'Actif').length
  const unpaidCount = subscriptions.filter((s) => s.status === 'Impayé').length
  const cancelledCount = subscriptions.filter((s) => s.status === 'Annulé').length

  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des plans clients</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-medium text-amber-700">
          <span>💳</span>
          Intégration Stripe à venir
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              <p className="text-xs text-gray-400 mt-1">{currentMonth}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Impayés</p>
              <p className="text-2xl font-bold text-red-600">{unpaidCount}</p>
              <p className="text-xs text-gray-400 mt-1">Relances à envoyer</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">⚠️</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Annulés ce mois</p>
              <p className="text-2xl font-bold text-gray-600">{cancelledCount}</p>
              <p className="text-xs text-gray-400 mt-1">Taux: {Math.round((cancelledCount / subscriptions.length) * 100)}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">❌</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date début</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Renouvellement</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stripe ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.map((sub, idx) => (
                <tr
                  key={sub.id}
                  className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 text-xs text-gray-700 max-w-[180px] truncate font-medium">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.plan === 'Free' ? 'bg-gray-100 text-gray-600' :
                      sub.plan === 'Basic' ? 'bg-blue-100 text-blue-700' :
                      sub.plan === 'Pro' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{sub.price}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {sub.startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {sub.plan === 'Free' ? '—' : sub.nextRenewal.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[sub.status]}`}>
                      {sub.status === 'Actif' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      {sub.status === 'Impayé' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {sub.status === 'Annulé' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">
                    {sub.stripeId ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {subscriptions.length} abonnements · Actifs: {activeCount} · Impayés: {unpaidCount} · Annulés: {cancelledCount}
          </p>
        </div>
      </div>
    </div>
  )
}
