'use client'

import CalendarCell from './CalendarCell'

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
  year: number
  month: number
  items: ContentItem[]
}

const DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Convert Sunday (0) to 7 for Monday-first week
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarGrid({ year, month, items }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const gridStart = getMonday(firstDay)
  // Get Sunday of the week containing lastDay
  const lastDayOfWeek = lastDay.getDay()
  const gridEnd = new Date(lastDay)
  const daysUntilSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  gridEnd.setDate(gridEnd.getDate() + daysUntilSunday)
  gridEnd.setHours(0, 0, 0, 0)

  // Build array of dates for the grid
  const gridDates: Date[] = []
  const cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    gridDates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  // Group items by date key
  const itemsByDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.scheduled_for) continue
    const dateKey = item.scheduled_for.slice(0, 10)
    if (!itemsByDate[dateKey]) itemsByDate[dateKey] = []
    itemsByDate[dateKey].push(item)
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7">
        {gridDates.map((date) => {
          const key = toDateKey(date)
          const cellItems = itemsByDate[key] ?? []
          const isToday = date.getTime() === today.getTime()
          const isCurrentMonth = date.getMonth() === month - 1

          return (
            <CalendarCell
              key={key}
              date={date}
              items={cellItems}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
            />
          )
        })}
      </div>
    </div>
  )
}
