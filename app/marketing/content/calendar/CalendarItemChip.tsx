'use client'

import { useRouter } from 'next/navigation'

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

const TYPE_DOT_COLORS: Record<ContentType, string> = {
  article: 'bg-green-500',
  social_post: 'bg-purple-500',
  video_brief: 'bg-red-500',
  image_brief: 'bg-orange-500',
  video_script: 'bg-blue-500',
  ad_creative: 'bg-yellow-500',
  email: 'bg-slate-500',
}

interface Props {
  item: ContentItem
}

export default function CalendarItemChip({ item }: Props) {
  const router = useRouter()
  const dotColor = TYPE_DOT_COLORS[item.type] ?? 'bg-slate-400'
  const isDraft = item.status === 'draft'
  const truncatedTitle = item.title.length > 25 ? item.title.slice(0, 25) + '…' : item.title

  return (
    <button
      onClick={() => router.push(`/marketing/content/factory?id=${item.id}`)}
      className={`flex items-center gap-1 w-full text-left px-1.5 py-0.5 rounded text-xs bg-slate-50 hover:bg-indigo-50 transition-colors ${isDraft ? 'opacity-60' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
      <span className="truncate text-slate-700 leading-tight">{truncatedTitle}</span>
    </button>
  )
}
