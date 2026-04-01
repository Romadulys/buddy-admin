import { supabase } from '@/lib/supabase'
import ReviewModerationCard from './ReviewModerationCard'

export const dynamic = 'force-dynamic'

type Review = {
  id: string
  created_at: string
  author_name: string
  author_role: string | null
  content: string
  rating: number
  coque_name: string | null
  published: boolean
  featured: boolean
  display_order: number
}

async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('display_order')

  if (error || !data) return []
  return data as Review[]
}

export default async function ReviewsPage() {
  const reviews = await getReviews()
  const published  = reviews.filter((r) => r.published).length
  const pending    = reviews.filter((r) => !r.published).length
  const featured   = reviews.filter((r) => r.featured).length

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reviews.length} avis · {published} publiés · {pending} en attente · {featured} mis en avant
          </p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>🗄️</span>
          Supabase
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Publiés</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">En attente</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mis en avant</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{featured}</p>
        </div>
      </div>

      {/* Pending section */}
      {pending > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
              En attente de modération ({pending})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviews
              .filter((r) => !r.published)
              .map((review) => (
                <ReviewModerationCard key={review.id} review={review} />
              ))}
          </div>
        </div>
      )}

      {/* Published section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Publiés ({published})
        </h2>
        {reviews.filter((r) => r.published).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
            <p className="text-4xl mb-3">⭐</p>
            <p className="font-semibold text-gray-600">Aucun avis publié</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {reviews
              .filter((r) => r.published)
              .map((review) => (
                <ReviewModerationCard key={review.id} review={review} />
              ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        Les avis soumis via le site arrivent ici avec statut &ldquo;En attente&rdquo; — publiez-les manuellement après vérification.
      </p>
    </div>
  )
}
