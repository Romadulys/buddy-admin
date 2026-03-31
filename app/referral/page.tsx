import { supabase } from '@/lib/supabase'

async function getReferralData() {
  // Get all referral codes with user info
  const { data: codes, error: codesError } = await supabase
    .from('referral_codes')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all referral uses
  const { data: uses, error: usesError } = await supabase
    .from('referral_uses')
    .select('*')
    .order('created_at', { ascending: false })

  if (codesError || usesError) {
    console.error('Referral fetch error:', codesError || usesError)
  }

  // Count uses per code
  const useCountMap: Record<string, number> = {}
  uses?.forEach((use) => {
    useCountMap[use.referral_code_id] = (useCountMap[use.referral_code_id] || 0) + 1
  })

  // Enrich codes with use counts
  const enrichedCodes = (codes ?? []).map((code) => ({
    ...code,
    use_count: useCountMap[code.id] || 0,
  }))

  // Top referrers (sorted by use count desc)
  const topReferrers = [...enrichedCodes]
    .sort((a, b) => b.use_count - a.use_count)
    .slice(0, 10)

  const totalCodes = codes?.length ?? 0
  const totalUses = uses?.length ?? 0
  const codesWithAtLeastOneUse = enrichedCodes.filter((c) => c.use_count > 0).length

  // Monthly referral activity (last 6 months)
  const monthlyActivity: { month: string; uses: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const count = (uses ?? []).filter((u) => {
      const created = new Date(u.created_at)
      return created >= monthStart && created <= monthEnd
    }).length
    monthlyActivity.push({
      month: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      uses: count,
    })
  }

  // Get user emails for top referrers
  let topReferrersWithEmails = topReferrers
  if (topReferrers.length > 0) {
    const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const userEmailMap: Record<string, string> = {}
    usersData?.users.forEach((u) => {
      userEmailMap[u.id] = u.email ?? '—'
    })
    topReferrersWithEmails = topReferrers.map((code) => ({
      ...code,
      email: userEmailMap[code.user_id] || code.user_id,
    }))
  }

  return {
    totalCodes,
    totalUses,
    codesWithAtLeastOneUse,
    conversionRate: totalCodes > 0 ? Math.round((codesWithAtLeastOneUse / totalCodes) * 100) : 0,
    topReferrers: topReferrersWithEmails,
    recentUses: (uses ?? []).slice(0, 20),
    monthlyActivity,
    allCodes: enrichedCodes,
  }
}

export default async function ReferralPage() {
  const data = await getReferralData()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parrainage</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analyse du programme de parrainage Buddy</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 font-medium text-purple-700">
          <span>🎁</span>
          Données Supabase en temps réel
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Codes créés',
            value: data.totalCodes,
            icon: '🏷️',
            color: 'bg-indigo-50 text-indigo-600',
            sub: 'Total referral_codes',
          },
          {
            label: 'Utilisations',
            value: data.totalUses,
            icon: '✅',
            color: 'bg-green-50 text-green-600',
            sub: 'Total referral_uses',
          },
          {
            label: 'Codes actifs',
            value: data.codesWithAtLeastOneUse,
            icon: '🔥',
            color: 'bg-orange-50 text-orange-600',
            sub: 'Au moins 1 utilisation',
          },
          {
            label: 'Taux conversion',
            value: `${data.conversionRate}%`,
            icon: '📈',
            color: 'bg-purple-50 text-purple-600',
            sub: 'Codes avec uses / total',
          },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 border border-current/10`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium opacity-70">{card.label}</p>
              <span>{card.icon}</span>
            </div>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            <p className="text-[10px] opacity-60 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top referrers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">🏆 Top parrains</h3>
            <span className="text-xs text-gray-400">{data.topReferrers.length} parrains actifs</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.topReferrers.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucun parrain pour l&apos;instant
              </div>
            ) : (
              data.topReferrers.map((referrer, idx) => (
                <div key={referrer.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-indigo-50 text-indigo-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{referrer.email || referrer.user_id}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{referrer.code}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{referrer.use_count}</span>
                    <span className="text-xs text-gray-400">filleul{referrer.use_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All codes table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Tous les codes</h3>
            <span className="text-xs text-gray-400">{data.allCodes.length} codes</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Code</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Utilisations</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Créé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.allCodes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-xs">
                      Aucun code disponible
                    </td>
                  </tr>
                ) : (
                  data.allCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {code.use_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            ✓ {code.use_count}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">0</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {new Date(code.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent uses */}
      {data.recentUses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Utilisations récentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">ID utilisation</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Code ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">User ID (filleul)</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentUses.map((use, idx) => (
                  <tr key={use.id} className={`hover:bg-indigo-50/20 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{use.id}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{use.referral_code_id}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{use.used_by_user_id}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(use.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
