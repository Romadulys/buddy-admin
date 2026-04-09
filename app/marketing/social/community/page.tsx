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

const SENTIMENT_LABELS: Record<string, string> = {
  positive: '😊 Positif',
  negative: '😠 Negatif',
  neutral: '😐 Neutre',
  question: '❓ Question',
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  neutral: 'bg-slate-100 text-slate-700',
  question: 'bg-yellow-100 text-yellow-800',
}

const URGENCY_ICONS: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
}

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook']

// ── Types ─────────────────────────────────────────────────────────────────────

interface Comment {
  id: string
  platform: string
  post_id: string | null
  author_name: string
  author_handle: string | null
  body: string
  sentiment: string
  urgency: string
  read: boolean
  replied: boolean
  reply_text: string | null
  created_at: string
  updated_at: string
}

interface CommentStats {
  total: number
  unread: number
  positive: number
  negative: number
  neutral: number
  question: number
}

// ── Time helper ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "a l'instant"
  if (m < 60) return `il y a ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

// ── Comment Card ──────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: Comment
  selected: boolean
  onClick: () => void
}

function CommentCard({ comment, selected, onClick }: CommentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition hover:bg-slate-50 ${selected ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-none mt-0.5">
          <span className="text-base">{PLATFORM_ICONS[comment.platform] ?? '💬'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-800 truncate">{comment.author_name}</span>
            {comment.author_handle && (
              <span className="text-xs text-slate-400 truncate">@{comment.author_handle}</span>
            )}
            <div className="ml-auto flex items-center gap-1.5 flex-none">
              {!comment.read && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="Non lu"></span>
              )}
              <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 mb-1">{comment.body}</p>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SENTIMENT_COLORS[comment.sentiment] ?? 'bg-slate-100 text-slate-600'}`}>
              {SENTIMENT_LABELS[comment.sentiment] ?? comment.sentiment}
            </span>
            <span className="text-xs" title={`Urgence: ${comment.urgency}`}>
              {URGENCY_ICONS[comment.urgency] ?? '⚪'}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  comment: Comment
  onMarkRead: () => void
  onReply: (text: string) => void
  replying: boolean
}

function DetailPanel({ comment, onMarkRead, onReply, replying }: DetailPanelProps) {
  const [replyText, setReplyText] = useState(comment.reply_text ?? '')

  // Reset reply text when comment changes
  useEffect(() => {
    setReplyText(comment.reply_text ?? '')
  }, [comment.id, comment.reply_text])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{PLATFORM_ICONS[comment.platform] ?? '💬'}</span>
          <span className="font-semibold text-slate-800">{comment.author_name}</span>
          {comment.author_handle && (
            <span className="text-sm text-slate-400">@{comment.author_handle}</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SENTIMENT_COLORS[comment.sentiment] ?? 'bg-slate-100 text-slate-600'}`}>
              {SENTIMENT_LABELS[comment.sentiment] ?? comment.sentiment}
            </span>
            <span className="text-sm" title={`Urgence: ${comment.urgency}`}>
              {URGENCY_ICONS[comment.urgency] ?? '⚪'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{PLATFORM_LABELS[comment.platform] ?? comment.platform}</span>
          <span>·</span>
          <span>{timeAgo(comment.created_at)}</span>
          {comment.post_id && (
            <>
              <span>·</span>
              <span className="text-slate-500">Post #{comment.post_id.slice(-6)}</span>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 overflow-y-auto">
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
        </div>

        {/* Mark as read button */}
        {!comment.read && (
          <button
            onClick={onMarkRead}
            className="mb-4 flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Marquer comme lu
          </button>
        )}

        {/* Reply section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            {comment.replied ? 'Reponse envoyee' : 'Repondre'}
          </h3>
          {comment.replied && comment.reply_text && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
              <p className="text-xs text-green-800 whitespace-pre-wrap">{comment.reply_text}</p>
            </div>
          )}
          {!comment.replied && (
            <>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="Tapez votre reponse..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none mb-2"
              />
              <button
                onClick={() => onReply(replyText)}
                disabled={replying || !replyText.trim()}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {replying ? 'Envoi...' : 'Envoyer la reponse'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats>({ total: 0, unread: 0, positive: 0, negative: 0, neutral: 0, question: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replying, setReplying] = useState(false)

  // Filters
  const [platformFilter, setPlatformFilter] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (platformFilter) params.set('platform', platformFilter)
      if (sentimentFilter) params.set('sentiment', sentimentFilter)
      if (urgencyFilter) params.set('urgency', urgencyFilter)
      if (unreadOnly) params.set('unread', 'true')

      const [commentsRes, statsRes] = await Promise.all([
        fetch(`/api/marketing/social/comments?${params}`),
        fetch('/api/marketing/social/comments/stats'),
      ])

      if (commentsRes.ok) {
        const data = await commentsRes.json()
        setComments(data.comments ?? data ?? [])
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [platformFilter, sentimentFilter, urgencyFilter, unreadOnly])

  useEffect(() => { fetchData() }, [fetchData])

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/marketing/social/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      await fetchData()
    } catch (err) {
      console.error('Mark read error:', err)
    }
  }

  const handleReply = async (id: string, text: string) => {
    setReplying(true)
    try {
      await fetch(`/api/marketing/social/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_text: text, replied: true }),
      })
      await fetchData()
    } catch (err) {
      console.error('Reply error:', err)
    } finally {
      setReplying(false)
    }
  }

  const selectedComment = comments.find((c) => c.id === selectedId) ?? null

  return (
    <div className="p-6 anim-section h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">💬 Community</h1>
        {stats.unread > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {stats.unread} non lus
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Total</span>
          <span className="ml-2 font-bold text-slate-800">{stats.total}</span>
        </div>
        <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Non lus</span>
          <span className="ml-2 font-bold text-blue-700">{stats.unread}</span>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-green-700">😊 {stats.positive}</span>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-red-700">😠 {stats.negative}</span>
        </div>
        <div className="bg-slate-50 rounded-lg border border-slate-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-slate-700">😐 {stats.neutral}</span>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-100 px-3 py-2 text-xs shadow-sm">
          <span className="text-yellow-700">❓ {stats.question}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="">Toutes les plateformes</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}</option>
          ))}
        </select>
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="">Tous les sentiments</option>
          {Object.entries(SENTIMENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="">Toutes urgences</option>
          <option value="high">🔴 Haute</option>
          <option value="medium">🟡 Moyenne</option>
          <option value="low">🟢 Faible</option>
        </select>
        <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer hover:bg-slate-50 transition">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-slate-600">Non lus seulement</span>
        </label>
      </div>

      {/* Split view */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left list */}
        <div className="w-96 flex-none bg-white rounded-xl border border-slate-100 shadow-sm overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Chargement...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-sm">
              Aucun commentaire. Les commentaires apparaitront quand les plateformes seront connectees.
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                selected={selectedId === comment.id}
                onClick={() => setSelectedId(comment.id)}
              />
            ))
          )}
        </div>

        {/* Right detail panel */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {selectedComment ? (
            <DetailPanel
              comment={selectedComment}
              onMarkRead={() => handleMarkRead(selectedComment.id)}
              onReply={(text) => handleReply(selectedComment.id, text)}
              replying={replying}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p>Selectionnez un commentaire pour voir les details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
