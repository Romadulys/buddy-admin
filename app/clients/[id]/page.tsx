import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ClientDetailTabs from './ClientDetailTabs'

async function getClientData(id: string) {
  // Get user from auth
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)
  if (userError || !userData.user) return null

  const user = userData.user

  // Get referral code for this user
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', id)
    .single()

  // Get referral uses if they have a code
  let referralUses: { id: string; used_by_user_id: string; created_at: string }[] = []
  if (referralCode) {
    const { data: uses } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referral_code_id', referralCode.id)
      .order('created_at', { ascending: false })
    referralUses = uses ?? []
  }

  return {
    user,
    referralCode,
    referralUses,
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getClientData(id)

  if (!data) notFound()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a href="/clients" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">
          ← Retour aux clients
        </a>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 font-medium">{data.user.email}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-sm">
          {(data.user.email?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.user.email}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Membre depuis {new Date(data.user.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <ClientDetailTabs data={data} />
    </div>
  )
}
