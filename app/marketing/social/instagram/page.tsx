'use client'

import { useState, useEffect, useCallback } from 'react'

const POST_TYPE_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  carousel: 'Carrousel',
  reel: 'Reel',
  story: 'Story',
  short: 'Short',
  text: 'Texte',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  review: 'En review',
  approved: 'Approuve',
  scheduled: 'Programme',
  published: 'Publie',
}

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
  performance: {
    likes?: number
    comments?: number
    saves?: number
    views?: number
  }
}

interface PlatformConnection {
  platform: string
  enabled: boolean
  connected: boolean
}

const GRID_COLORS = [
  'bg-pink-200', 'bg-rose-200', 'bg-fuchsia-200', 'bg-purple-200',
  'bg-indigo-200', 'bg-violet-200', 'bg-pink-300', 'bg-rose-300', 'bg-fuchsia-300',
]

export default function InstagramPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [platform, setPlatform] = useState<PlatformConnection | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, platformsRes] = await Promise.all([
        fetch('/api/marketing/social/posts?platform=instagram'),
        fetch('/api/marketing/platforms'),
      ])
      if (postsRes.ok) {
        const data = await postsRes.json()
        setPosts(data.posts ?? data ?? [])
      }
      if (platformsRes.ok) {
        const data = await platformsRes.json()
        const platforms: PlatformConnection[] = data.platforms ?? data ?? []
        setPlatform(platforms.find((p) => p.platform === 'instagram') ?? null)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const publishedPosts = posts.filter((p) => p.status === 'published')
  const feedPosts = publishedPosts.slice(0, 9)

  const avgLikes = publishedPosts.length
    ? Math.round(publishedPosts.reduce((s, p) => s + (p.performance?.likes ?? 0), 0) / publishedPosts.length)
    : null
  const avgComments = publishedPosts.length
    ? Math.round(publishedPosts.reduce((s, p) => s + (p.performance?.comments ?? 0), 0) / publishedPosts.length)
    : null
  const avgSaves = publishedPosts.length
    ? Math.round(publishedPosts.reduce((s, p) => s + (p.performance?.saves ?? 0), 0) / publishedPosts.length)
    : null

  const topPost = publishedPosts.reduce<SocialPost | null>((best, p) => {
    if (!best) return p
    const bScore = (best.performance?.likes ?? 0) + (best.performance?.comments ?? 0)
    const pScore = (p.performance?.likes ?? 0) + (p.performance?.comments ?? 0)
    return pScore > bScore ? p : best
  }, null)

  if (loading) {
    return (
      <div className="p-6 anim-section">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">📸 Instagram</h1>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Chargement...</div>
      </div>
    )
  }

  if (platform && !platform.enabled) {
    return (
      <div className="p-6 anim-section">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">📸 Instagram</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📸</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Instagram non connecte</h2>
          <p className="text-slate-500 text-sm mb-6">Activez Instagram pour commencer a planifier vos posts.</p>
          <a
            href="/marketing/platforms"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            Activez Instagram dans Connexions →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📸 Instagram</h1>
        {platform?.connected && platform?.enabled && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Connecte
          </p>
        )}
      </div>

      {/* Feed preview 3x3 */}
      {feedPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-700 mb-3">Apercu du feed</h2>
          <div className="grid grid-cols-3 gap-1 max-w-sm">
            {Array.from({ length: 9 }, (_, i) => {
              const post = feedPosts[i]
              return post ? (
                <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative group">
                  {post.media_url ? (
                    <img
                      src={post.media_url}
                      alt={post.caption.slice(0, 40)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full ${GRID_COLORS[i % GRID_COLORS.length]} flex items-center justify-center`}>
                      <span className="text-2xl opacity-60">
                        {post.post_type === 'reel' ? '🎬' : post.post_type === 'story' ? '⭕' : '🖼️'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                  </div>
                </div>
              ) : (
                <div key={`empty-${i}`} className="aspect-square rounded-lg bg-slate-50 border border-dashed border-slate-200" />
              )
            })}
          </div>
        </div>
      )}

      {/* Performance cards */}
      {publishedPosts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-pink-600">{avgLikes ?? '--'}</div>
            <div className="text-xs text-slate-500 mt-1">Likes moy.</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{avgComments ?? '--'}</div>
            <div className="text-xs text-slate-500 mt-1">Comments moy.</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-indigo-600">{avgSaves ?? '--'}</div>
            <div className="text-xs text-slate-500 mt-1">Saves moy.</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="text-lg font-bold text-slate-800 line-clamp-1">{topPost ? topPost.caption.slice(0, 20) + '...' : '--'}</div>
            <div className="text-xs text-slate-500 mt-1">Top post</div>
          </div>
        </div>
      )}

      {/* Posts table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">Tous les posts Instagram</h2>
          <span className="text-xs text-slate-400">{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucun post Instagram. Cree ton premier post dans le Planner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Caption</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Hashtags</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Statut</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-slate-700">{post.caption}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-pink-50 text-pink-700">
                        {POST_TYPE_LABELS[post.post_type] ?? post.post_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">#{post.hashtags.length}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('fr-FR')
                        : post.scheduled_for
                        ? new Date(post.scheduled_for).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
