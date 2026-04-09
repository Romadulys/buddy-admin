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
  item: ContentItem
  onUpdate: (updates: Partial<ContentItem>) => void
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

const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus | null> = {
  draft: 'review',
  review: 'approved',
  approved: 'scheduled',
  scheduled: 'published',
  published: null,
}

const STATUS_TRANSITION_LABELS: Record<ContentStatus, string> = {
  draft: 'Envoyer en review →',
  review: 'Approuver →',
  approved: 'Programmer →',
  scheduled: 'Publier →',
  published: '',
}

const CHANNELS = ['Blog', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']

export default function ContentSidebar({ item, onUpdate }: Props) {
  const [seoKeyword, setSeoKeyword] = useState(String(item.seo_data?.keyword ?? ''))
  const [seoTitle, setSeoTitle] = useState(String(item.seo_data?.meta_title ?? ''))
  const [seoDescription, setSeoDescription] = useState(String(item.seo_data?.meta_description ?? ''))
  const [seoSlug, setSeoSlug] = useState(String(item.seo_data?.slug ?? ''))
  const [scheduledFor, setScheduledFor] = useState(item.scheduled_for?.slice(0, 10) ?? '')
  const [channels, setChannels] = useState<string[]>(item.target_channels ?? [])

  const handleSeoSave = () => {
    onUpdate({
      seo_data: {
        ...item.seo_data,
        keyword: seoKeyword,
        meta_title: seoTitle,
        meta_description: seoDescription,
        slug: seoSlug,
      },
    })
  }

  const handleChannelToggle = (channel: string) => {
    const next = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel]
    setChannels(next)
    onUpdate({ target_channels: next })
  }

  const handleScheduledFor = (value: string) => {
    setScheduledFor(value)
    onUpdate({ scheduled_for: value ? value + 'T00:00:00Z' : null })
  }

  const nextStatus = STATUS_TRANSITIONS[item.status]

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Quick info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Informations</h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Type</span>
            <span className="text-xs font-medium text-slate-700">{CONTENT_TYPE_LABELS[item.type]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Cree le</span>
            <span className="text-xs text-slate-700">{formatDate(item.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Mis a jour</span>
            <span className="text-xs text-slate-700">{formatDate(item.updated_at)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</h3>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${CONTENT_STATUS_COLORS[item.status]}`}>
            {CONTENT_STATUS_LABELS[item.status]}
          </span>
          {nextStatus && (
            <button
              onClick={() => onUpdate({ status: nextStatus })}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              {STATUS_TRANSITION_LABELS[item.status]}
            </button>
          )}
          {item.status !== 'draft' && (
            <button
              onClick={() => onUpdate({ status: 'draft' })}
              className="w-full py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition-colors"
            >
              ← Repasser en brouillon
            </button>
          )}
        </div>

        {/* Planning */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Planification</h3>

          <div>
            <label className="text-xs text-slate-600 block mb-1">Date de publication</label>
            <input
              type="date"
              value={scheduledFor}
              onChange={(e) => handleScheduledFor(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-2">Canaux cibles</label>
            <div className="space-y-1.5">
              {CHANNELS.map((channel) => (
                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                    className="w-3.5 h-3.5 rounded text-indigo-600"
                  />
                  <span className="text-xs text-slate-700">{channel}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SEO — articles only */}
        {item.type === 'article' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO</h3>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Mot-cle principal</label>
              <input
                type="text"
                value={seoKeyword}
                onChange={(e) => setSeoKeyword(e.target.value)}
                placeholder="ex: buddy app enfant..."
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Meta title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Titre SEO (60 car. max)"
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-400 mt-0.5">{seoTitle.length}/60</p>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Meta description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Description SEO (160 car. max)"
                rows={3}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-0.5">{seoDescription.length}/160</p>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">Slug URL</label>
              <input
                type="text"
                value={seoSlug}
                onChange={(e) => setSeoSlug(e.target.value)}
                placeholder="mon-article-seo"
                className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleSeoSave}
              className="w-full py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              Sauvegarder SEO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
