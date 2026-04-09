'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import CalendarGrid from './CalendarGrid'

type ContentType = 'article' | 'social_post' | 'video_brief' | 'image_brief' | 'video_script' | 'ad_creative' | 'email'
type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published'

interface ContentItem {
  id: string
  proposal_id: string | null
  type: ContentType
  title: string
  body: Record<string, unknown>
  seo_data: Record<string, unknown>
  target_channels: string[]
  parent_content_id: string | null
  status: ContentStatus
  scheduled_for: string | null
  published_at: string | null
  published_url: string | null
  performance: Record<string, unknown>
  created_at: string
  updated_at: string
}

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  social_post: 'Post social',
  video_brief: 'Brief video',
  image_brief: 'Brief image',
  video_script: 'Script video',
  ad_creative: 'Creative pub',
  email: 'Email',
}

export default function CalendarPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketing/content/calendar?year=${year}&month=${month}`)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setItems(data.items ?? data ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const goToPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goToNext = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  // Count by type for stats bar
  const typeCounts = items.reduce<Partial<Record<ContentType, number>>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1
    return acc
  }, {})

  const articleCount = typeCounts.article ?? 0
  const postCount = typeCounts.social_post ?? 0
  const briefCount = (typeCounts.video_brief ?? 0) + (typeCounts.image_brief ?? 0)

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📅 Calendrier editorial</h1>
        <button
          onClick={() => router.push('/marketing/content/factory')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          ➕ Nouveau contenu
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={goToPrev}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors font-medium"
          aria-label="Mois precedent"
        >
          ←
        </button>
        <span className="text-lg font-semibold text-slate-800 min-w-40 text-center">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={goToNext}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors font-medium"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {articleCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {articleCount} article{articleCount !== 1 ? 's' : ''}
          </span>
        )}
        {postCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            {postCount} post{postCount !== 1 ? 's' : ''}
          </span>
        )}
        {briefCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {briefCount} brief{briefCount !== 1 ? 's' : ''}
          </span>
        )}
        {Object.entries(typeCounts)
          .filter(([type]) => !['article', 'social_post', 'video_brief', 'image_brief'].includes(type))
          .map(([type, count]) => (
            <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {count} {CONTENT_TYPE_LABELS[type as ContentType] ?? type}
            </span>
          ))}
        {items.length === 0 && !loading && (
          <span className="text-sm text-slate-400">Aucun contenu programme ce mois-ci</span>
        )}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
      ) : (
        <CalendarGrid year={year} month={month} items={items} />
      )}
    </div>
  )
}
