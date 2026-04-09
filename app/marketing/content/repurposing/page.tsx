'use client'

import { useState, useEffect, useCallback } from 'react'
import RepurposingCard from './RepurposingCard'

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

interface RepurposingGroup {
  parent: ContentItem
  children: ContentItem[]
}

export default function RepurposingPage() {
  const [groups, setGroups] = useState<RepurposingGroup[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAndGroup = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/content/items')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      const allItems: ContentItem[] = data.items ?? data ?? []

      // Group by parent_content_id
      const childrenByParent: Record<string, ContentItem[]> = {}
      const childIds = new Set<string>()

      for (const item of allItems) {
        if (item.parent_content_id) {
          if (!childrenByParent[item.parent_content_id]) {
            childrenByParent[item.parent_content_id] = []
          }
          childrenByParent[item.parent_content_id].push(item)
          childIds.add(item.id)
        }
      }

      // Build groups: published items that are parents, or any published without children (show "generate" option)
      const publishedRoots = allItems.filter(
        (item) => item.status === 'published' && !childIds.has(item.id)
      )

      const grouped: RepurposingGroup[] = publishedRoots.map((parent) => ({
        parent,
        children: childrenByParent[parent.id] ?? [],
      }))

      setGroups(grouped)
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAndGroup()
  }, [fetchAndGroup])

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">♻️ Repurposing — Declinaisons de contenu</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generez des declinaisons de vos contenus publies vers d&apos;autres formats et canaux
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
          <span className="text-5xl">♻️</span>
          <p className="text-sm">Publiez du contenu d&apos;abord pour generer des declinaisons</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <RepurposingCard
              key={group.parent.id}
              parent={group.parent}
              children={group.children}
            />
          ))}
        </div>
      )}
    </div>
  )
}
