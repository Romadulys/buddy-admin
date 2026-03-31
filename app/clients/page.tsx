import { supabase } from '@/lib/supabase'
import ClientsTable from './ClientsTable'

async function getClients() {
  // Fetch all users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (usersError || !usersData) return []

  // Fetch referral codes with usage count
  const { data: referralCodes } = await supabase
    .from('referral_codes')
    .select('user_id, code, id')

  const { data: referralUses } = await supabase
    .from('referral_uses')
    .select('referral_code_id')

  // Build a map: code_id -> use count
  const useCountMap: Record<string, number> = {}
  referralUses?.forEach((use) => {
    useCountMap[use.referral_code_id] = (useCountMap[use.referral_code_id] || 0) + 1
  })

  // Build a map: user_id -> referral count
  const userReferralMap: Record<string, number> = {}
  referralCodes?.forEach((rc) => {
    userReferralMap[rc.user_id] = (userReferralMap[rc.user_id] || 0) + (useCountMap[rc.id] || 0)
  })

  return usersData.users.map((user) => ({
    id: user.id,
    email: user.email ?? '—',
    created_at: user.created_at,
    plan: 'Free',
    referrals: userReferralMap[user.id] ?? 0,
    provider: user.app_metadata?.provider ?? 'email',
  }))
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} utilisateurs enregistrés</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 font-medium text-indigo-700">
          <span>🔄</span>
          Données Supabase Auth en temps réel
        </div>
      </div>

      {/* Table with search */}
      <ClientsTable clients={clients} />
    </div>
  )
}
