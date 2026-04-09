'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ContentList from './ContentList'
import ContentEditor from './ContentEditor'
import ContentSidebar from './ContentSidebar'

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

function FactoryPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselectedId = searchParams.get('id')

  const [items, setItems] = useState<ContentItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [loadingItem, setLoadingItem] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/marketing/content/items')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setItems(data.items ?? data ?? [])
    } catch {
      setItems([])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Pre-select item from URL param
  useEffect(() => {
    if (!preselectedId || loadingList) return
    const found = items.find((i) => i.id === preselectedId)
    if (found) {
      fetchFullItem(found.id)
    }
  }, [preselectedId, loadingList, items])

  const fetchFullItem = async (id: string) => {
    setLoadingItem(true)
    try {
      const res = await fetch(`/api/marketing/content/items/${id}`)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setSelectedItem(data.item ?? data)
    } catch {
      // fallback: use list item
      const found = items.find((i) => i.id === id)
      if (found) setSelectedItem(found)
    } finally {
      setLoadingItem(false)
    }
  }

  const handleSelect = (item: ContentItem) => {
    router.replace(`/marketing/content/factory?id=${item.id}`, { scroll: false })
    fetchFullItem(item.id)
  }

  const handleSave = async (updates: Partial<ContentItem>) => {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/marketing/content/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = data.item ?? data
        setSelectedItem(updated)
        setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
      }
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  const handleCreate = async (type: ContentType, title: string) => {
    try {
      const res = await fetch('/api/marketing/content/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, status: 'draft', body: {}, seo_data: {}, target_channels: [] }),
      })
      if (res.ok) {
        const data = await res.json()
        const newItem: ContentItem = data.item ?? data
        setItems((prev) => [newItem, ...prev])
        handleSelect(newItem)
      }
    } catch (err) {
      console.error('Create error:', err)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel: content list */}
      {loadingList ? (
        <div className="w-80 flex-shrink-0 flex items-center justify-center border-r border-slate-200 text-slate-400 text-sm">
          Chargement...
        </div>
      ) : (
        <ContentList
          items={items}
          selectedId={selectedItem?.id ?? null}
          onSelect={handleSelect}
          onCreate={handleCreate}
        />
      )}

      {/* Center panel: editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loadingItem ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Chargement du contenu...
          </div>
        ) : selectedItem ? (
          <ContentEditor item={selectedItem} onSave={handleSave} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <span className="text-5xl">✏️</span>
            <p className="text-sm">Selectionnez ou creez un contenu</p>
          </div>
        )}
      </div>

      {/* Right panel: sidebar */}
      {selectedItem && !loadingItem && (
        <ContentSidebar item={selectedItem} onUpdate={handleSave} />
      )}
    </div>
  )
}

export default function FactoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-slate-400 text-sm">
        Chargement...
      </div>
    }>
      <FactoryPageInner />
    </Suspense>
  )
}
