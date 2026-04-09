'use client'

import CalendarItemChip from './CalendarItemChip'

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
  date: Date
  items: ContentItem[]
  isToday: boolean
  isCurrentMonth: boolean
}

export default function CalendarCell({ date, items, isToday, isCurrentMonth }: Props) {
  const dayNumber = date.getDate()
  const visibleItems = items.slice(0, 3)
  const overflowCount = items.length - 3

  return (
    <div
      className={`min-h-28 border-b border-r border-slate-100 p-1 ${isCurrentMonth ? '' : 'opacity-40'}`}
    >
      <div className="flex items-center justify-end mb-1">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            isToday
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
              : 'text-slate-500'
          }`}
        >
          {dayNumber}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <CalendarItemChip key={item.id} item={item} />
        ))}
        {overflowCount > 0 && (
          <span className="text-xs text-slate-400 px-1.5 font-medium">+{overflowCount}</span>
        )}
      </div>
    </div>
  )
}
