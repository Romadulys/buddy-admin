import { supabase } from '@/lib/supabase'

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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default async function ReviewsPage() {
  const reviews = await getReviews()
  const published = reviews.filter((r) => r.published).length
  const featured = reviews.filter((r) => r.featured).length

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reviews.length} avis · {published} publiés · {featured} mis en avant</p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>🗄️</span>
          Gérer dans Supabase
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Publiés</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mis en avant</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{featured}</p>
        </div>
      </div>

      {/* Cards grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-semibold text-gray-600">Aucun avis pour l&apos;instant</p>
          <p className="text-sm mt-1">Ajoutez des avis dans Supabase pour qu&apos;ils apparaissent ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{review.author_name}</p>
                  {review.author_role && (
                    <p className="text-xs text-gray-400">{review.author_role}</p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {review.featured && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">⭐ Mis en avant</span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    review.published
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {review.published ? 'Publié' : 'Masqué'}
                  </span>
                </div>
              </div>
              <Stars rating={review.rating} />
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.content}</p>
              {review.coque_name && (
                <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full inline-block">
                  🎨 {review.coque_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Pour ajouter ou modifier des avis, utilisez{' '}
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Supabase
        </a>.
        Une interface d&apos;édition complète arrive prochainement.
      </p>
    </div>
  )
}
