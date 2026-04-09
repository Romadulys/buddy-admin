'use client'

import { useState } from 'react'

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

interface Props {
  items: ContentItem[]
  selectedId: string | null
  onSelect: (item: ContentItem) => void
  onCreate: (type: ContentType, title: string) => void
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  social_post: 'Post social',
  video_brief: 'Brief video',
  image_brief: 'Brief image',
  video_script: 'Script video',
  ad_creative: 'Creative pub',
  email: 'Email',
}

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  article: '📄',
  social_post: '📱',
  video_brief: '🎬',
  image_brief: '🖼️',
  video_script: '🎥',
  ad_creative: '📢',
  email: '✉️',
}

const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Brouillon',
  review: 'En review',
  approved: 'Approuve',
  scheduled: 'Programme',
  published: 'Publie',
}

const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  published: 'bg-green-100 text-green-800',
}

const STATUS_DOT_COLORS: Record<ContentStatus, string> = {
  draft: 'bg-gray-400',
  review: 'bg-amber-500',
  approved: 'bg-blue-500',
  scheduled: 'bg-purple-500',
  published: 'bg-green-500',
}

export default function ContentList({ items, selectedId, onSelect, onCreate }: Props) {
  const [typeFilter, setTypeFilter] = useState<ContentType | ''>('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newType, setNewType] = useState<ContentType>('article')
  const [newTitle, setNewTitle] = useState('')

  const filteredItems = items.filter((item) => {
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const handleCreate = () => {
    if (!newTitle.trim()) return
    onCreate(newType, newTitle.trim())
    setNewTitle('')
    setShowNewForm(false)
  }

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Contenus</h2>
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            ➕ Nouveau
          </button>
        </div>

        {/* Inline new form */}
        {showNewForm && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ContentType)}
              className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
                <option key={t} value={t}>{CONTENT_TYPE_ICONS[t]} {CONTENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Titre du contenu..."
              className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 py-1.5 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Creer
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewTitle('') }}
                className="px-2.5 py-1.5 rounded bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ContentType | '')}
            className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tous types</option>
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
              <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentStatus | '')}
            className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tous statuts</option>
            {(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map((s) => (
              <option key={s} value={s}>{CONTENT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm gap-2">
            <span className="text-2xl">📭</span>
            <p>Aucun contenu</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${selectedId === item.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0 mt-0.5">{CONTENT_TYPE_ICONS[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT_COLORS[item.status]}`} />
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${CONTENT_STATUS_COLORS[item.status]}`}>
                        {CONTENT_STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    {item.scheduled_for && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.scheduled_for).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
