'use client'

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
  parent: ContentItem
  children: ContentItem[]
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function RepurposingCard({ parent, children }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Parent card */}
        <div className="flex-shrink-0 w-full lg:w-64 bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xl">{CONTENT_TYPE_ICONS[parent.type]}</span>
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                {CONTENT_TYPE_LABELS[parent.type]}
              </p>
              <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">
                {parent.title}
              </p>
            </div>
          </div>
          {parent.published_at && (
            <p className="text-xs text-slate-500 mb-2">
              Publie le {formatDate(parent.published_at)}
            </p>
          )}
          {parent.published_url && (
            <a
              href={parent.published_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline truncate block"
            >
              Voir la publication →
            </a>
          )}
        </div>

        {/* Arrow connector */}
        <div className="flex items-center justify-center flex-shrink-0 text-slate-400 font-bold text-xl lg:pt-6">
          <span className="hidden lg:block">→</span>
          <span className="lg:hidden">↓</span>
        </div>

        {/* Children cards */}
        <div className="flex-1">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 gap-2">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                onClick={() => alert('Fonctionnalite de generation a venir')}
              >
                ♻️ Generer des declinaisons
              </button>
              <p className="text-xs text-slate-400">Aucune declinaison existante</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-base">{CONTENT_TYPE_ICONS[child.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500">{CONTENT_TYPE_LABELS[child.type]}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{child.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CONTENT_STATUS_COLORS[child.status]}`}>
                      {CONTENT_STATUS_LABELS[child.status]}
                    </span>
                  </div>

                  {child.target_channels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {child.target_channels.map((channel) => (
                        <span
                          key={channel}
                          className="inline-flex px-1.5 py-0.5 rounded text-xs bg-slate-200 text-slate-600"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
