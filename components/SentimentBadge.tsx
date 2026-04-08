'use client'

import { Sentiment, SENTIMENT_CONFIG } from '@/lib/email-mock'

interface SentimentBadgeProps {
  sentiment: Sentiment | null
  size?: 'sm' | 'md'
}

export function SentimentBadge({ sentiment, size = 'sm' }: SentimentBadgeProps) {
  if (sentiment === null) {
    return (
      <span className={`rounded-full font-medium ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} bg-gray-100 text-gray-700`}>
        —
      </span>
    )
  }

  const config = SENTIMENT_CONFIG[sentiment]

  return (
    <span
      className={`rounded-full font-medium inline-flex items-center gap-1 ${
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
      } ${config.color}`}
    >
      <span>{config.emoji}</span>
      {size === 'md' && <span>{config.label}</span>}
    </span>
  )
}
