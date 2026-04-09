'use client'

import { Priority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/marketing/types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
