'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewModerationCard({ review }: { review: Review }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (fields: Partial<Pick<Review, 'published' | 'featured'>>) => {
    setLoading(true)
    try {
      await fetch(`/api/content/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer l'avis de ${review.author_name} ? Cette action est irréversible.`)) return
    setLoading(true)
    try {
      await fetch(`/api/content/reviews/${review.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-5 space-y-3 transition-opacity ${
        loading ? 'opacity-50 pointer-events-none' : ''
      } ${!review.published ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{review.author_name}</p>
          {review.author_role && (
            <p className="text-xs text-gray-400">{review.author_role}</p>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {review.featured && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              ⭐ Mis en avant
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              review.published
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-orange-100 text-orange-700 border-orange-200'
            }`}
          >
            {review.published ? '✓ Publié' : '⏳ En attente'}
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

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {/* Publish toggle */}
        <button
          onClick={() => patch({ published: !review.published })}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
            review.published
              ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          }`}
        >
          {review.published ? '✕ Dépublier' : '✓ Publier'}
        </button>

        {/* Feature toggle */}
        <button
          onClick={() => patch({ featured: !review.featured })}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
            review.featured
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-200'
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
          }`}
        >
          {review.featured ? '★ Retirer vedette' : '☆ Mettre en avant'}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg font-semibold border bg-white text-red-500 border-red-200 hover:bg-red-50 transition-colors"
        >
          🗑 Supprimer
        </button>
      </div>
    </div>
  )
}
