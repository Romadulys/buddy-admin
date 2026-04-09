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
    views?: number
    watch_time?: number
    subscribers_gained?: number
  }
}

interface PlatformConnection {
  platform: string
  enabled: boolean
  connected: boolean
  account_name: string | null
}

export default function YouTubePage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [platform, setPlatform] = useState<PlatformConnection | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, platformsRes] = await Promise.all([
        fetch('/api/marketing/social/posts?platform=youtube'),
        fetch('/api/marketing/platforms'),
      ])
      if (postsRes.ok) {
        const data = await postsRes.json()
        setPosts(data.posts ?? data ?? [])
      }
      if (platformsRes.ok) {
        const data = await platformsRes.json()
        const platforms: PlatformConnection[] = data.platforms ?? data ?? []
        setPlatform(platforms.find((p) => p.platform === 'youtube') ?? null)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="p-6 anim-section">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">▶️ YouTube</h1>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Chargement...</div>
      </div>
    )
  }

  if (platform && !platform.enabled) {
    return (
      <div className="p-6 anim-section">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">▶️ YouTube</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">▶️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">YouTube non connecte</h2>
          <p className="text-slate-500 text-sm mb-6">Activez YouTube pour gerer vos videos et Shorts.</p>
          <a
            href="/marketing/platforms"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition shadow-sm"
          >
            Activez YouTube dans Connexions →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">▶️ YouTube</h1>
        {platform?.connected && platform?.enabled && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Connecte{platform.account_name ? ` — ${platform.account_name}` : ''}
          </p>
        )}
      </div>

      {/* Channel stats placeholder */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Abonnes', icon: '👥' },
          { label: 'Vues totales', icon: '👁️' },
          { label: 'Watch Time (h)', icon: '⏱️' },
        ].map(({ label, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-400">--</div>
            <div className="text-xs text-slate-400 mt-1">Disponible apres connexion</div>
          </div>
        ))}
      </div>

      {/* Video list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">Videos &amp; Shorts</h2>
          <span className="text-xs text-slate-400">{posts.length} videos</span>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucune video YouTube. Cree ton premier post dans le Planner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Titre</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Statut</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Vues</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        {post.media_url ? (
                          <div className="w-16 h-10 rounded overflow-hidden bg-slate-100 flex-none">
                            <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-10 rounded bg-red-100 flex items-center justify-center flex-none">
                            <span className="text-red-600 text-xs">▶</span>
                          </div>
                        )}
                        <p className="truncate text-slate-700">{post.caption}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                        {POST_TYPE_LABELS[post.post_type] ?? post.post_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {post.performance?.views?.toLocaleString('fr-FR') ?? '—'}
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
