'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '▶️',
  linkedin: '💼',
  facebook: '👤',
}

const POST_TYPE_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  carousel: 'Carrousel',
  reel: 'Reel',
  story: 'Story',
  short: 'Short',
  text: 'Texte',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  review: 'En review',
  approved: 'Approuve',
  scheduled: 'Programme',
  published: 'Publie',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-purple-100 text-purple-800',
}

const KANBAN_STATUSES = ['draft', 'review', 'approved', 'scheduled', 'published']

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook']

// ── Types ─────────────────────────────────────────────────────────────────────

interface SocialPost {
  id: string
  platform: string
  post_type: string
  caption: string
  hashtags: string[]
  media_url: string | null
  scheduled_for: string | null
  status: string
  published_at: string | null
  performance: Record<string, unknown>
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date()
  const monday = new Date(now)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'a l\'instant'
  if (m < 60) return `il y a ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

// ── New Post Modal ────────────────────────────────────────────────────────────

interface NewPostModalProps {
  onClose: () => void
  onCreated: () => void
}

function NewPostModal({ onClose, onCreated }: NewPostModalProps) {
  const [form, setForm] = useState({
    platform: 'instagram',
    post_type: 'image',
    caption: '',
    hashtags: '',
    media_url: '',
    scheduled_for: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        platform: form.platform,
        post_type: form.post_type,
        caption: form.caption,
        hashtags: form.hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        media_url: form.media_url || null,
        scheduled_for: form.scheduled_for || null,
        status: 'draft',
      }
      const res = await fetch('/api/marketing/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Erreur lors de la creation')
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">➕ Nouveau post</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plateforme</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select
                value={form.post_type}
                onChange={(e) => setForm((p) => ({ ...p, post_type: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {Object.entries(POST_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              required
              rows={4}
              placeholder="Ecrivez votre caption..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Hashtags (separés par virgules)</label>
            <input
              type="text"
              value={form.hashtags}
              onChange={(e) => setForm((p) => ({ ...p, hashtags: e.target.value }))}
              placeholder="#marketing, #content, #social"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">URL Media</label>
            <input
              type="url"
              value={form.media_url}
              onChange={(e) => setForm((p) => ({ ...p, media_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date de publication</label>
            <input
              type="datetime-local"
              value={form.scheduled_for}
              onChange={(e) => setForm((p) => ({ ...p, scheduled_for: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {saving ? 'Creation...' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Calendar View ─────────────────────────────────────────────────────────────

interface CalendarViewProps {
  posts: SocialPost[]
  weekOffset: number
  onChangeWeek: (d: number) => void
}

function CalendarView({ posts, weekOffset, onChangeWeek }: CalendarViewProps) {
  const days = getWeekDays(weekOffset)
  const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const postsByDay: Record<string, SocialPost[]> = {}
  days.forEach((d) => { postsByDay[formatDateKey(d)] = [] })
  posts.forEach((p) => {
    const key = p.scheduled_for?.slice(0, 10) ?? p.published_at?.slice(0, 10)
    if (key && postsByDay[key] !== undefined) postsByDay[key].push(p)
  })

  const rangeLabel = `${days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onChangeWeek(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
        >
          ←
        </button>
        <span className="text-sm font-medium text-slate-700">{rangeLabel}</span>
        <button
          onClick={() => onChangeWeek(1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const key = formatDateKey(day)
          const dayPosts = postsByDay[key] ?? []
          const isToday = key === formatDateKey(new Date())
          return (
            <div key={key} className={`rounded-xl border ${isToday ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white'} p-2 min-h-32`}>
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-purple-700' : 'text-slate-500'}`}>
                {DAY_NAMES[i]}
              </div>
              <div className={`text-sm font-bold mb-2 ${isToday ? 'text-purple-800' : 'text-slate-700'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-100 text-xs truncate"
                    title={post.caption}
                  >
                    <span>{PLATFORM_ICONS[post.platform] ?? '📄'}</span>
                    <span className="truncate text-slate-600">{post.caption.slice(0, 20)}</span>
                  </div>
                ))}
                {dayPosts.length === 0 && (
                  <div className="text-xs text-slate-300 italic">Vide</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Kanban View ───────────────────────────────────────────────────────────────

interface KanbanViewProps {
  posts: SocialPost[]
}

function KanbanView({ posts }: KanbanViewProps) {
  const byStatus: Record<string, SocialPost[]> = {}
  KANBAN_STATUSES.forEach((s) => { byStatus[s] = [] })
  posts.forEach((p) => {
    if (byStatus[p.status]) byStatus[p.status].push(p)
  })

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_STATUSES.map((status) => (
        <div key={status} className="flex-none w-64">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className="text-xs text-slate-400">{byStatus[status].length}</span>
          </div>
          <div className="space-y-2">
            {byStatus[status].map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{PLATFORM_ICONS[post.platform] ?? '📄'}</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {POST_TYPE_LABELS[post.post_type] ?? post.post_type}
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-2 mb-2">{post.caption}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>#{post.hashtags.length} tags</span>
                  {post.scheduled_for && (
                    <span>{new Date(post.scheduled_for).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  )}
                </div>
              </div>
            ))}
            {byStatus[status].length === 0 && (
              <div className="text-xs text-slate-300 italic text-center py-4">Aucun post</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SocialPlannerPage() {
  const [view, setView] = useState<'calendar' | 'kanban'>('calendar')
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [platformFilter, setPlatformFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (platformFilter !== 'all') params.set('platform', platformFilter)
      const res = await fetch(`/api/marketing/social/posts?${params}`)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setPosts(data.posts ?? data ?? [])
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }, [platformFilter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📱 Social Planner</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition shadow-sm"
        >
          ➕ Nouveau post
        </button>
      </div>

      {/* Platform filter tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setPlatformFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${platformFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Tous
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${platformFilter === p ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Calendrier
        </button>
        <button
          onClick={() => setView('kanban')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Kanban
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Chargement...</div>
      ) : view === 'calendar' ? (
        <CalendarView
          posts={posts}
          weekOffset={weekOffset}
          onChangeWeek={(d) => setWeekOffset((w) => w + d)}
        />
      ) : (
        <KanbanView posts={posts} />
      )}

      {/* Modal */}
      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onCreated={fetchPosts}
        />
      )}
    </div>
  )
}
