'use client'

import { Email, CATEGORIE_LABELS, CATEGORIE_COLORS, URGENCE_CONFIG } from '@/lib/email-mock'
import { SentimentBadge } from './SentimentBadge'

interface EmailCardProps {
  email: Email
  onClick: (email: Email) => void
  isSelected: boolean
}

function getElapsedTime(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}j`
}

function getPriorityColor(score: number): string {
  if (score >= 75) return 'bg-red-500'
  if (score >= 50) return 'bg-orange-500'
  if (score >= 25) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function EmailCard({ email, onClick, isSelected }: EmailCardProps) {
  const urgenceConfig = URGENCE_CONFIG[email.ai_urgence]
  const categorieLabelConfig = CATEGORIE_LABELS[email.ai_categorie]
  const categorieColorConfig = CATEGORIE_COLORS[email.ai_categorie]
  const priorityColor = getPriorityColor(email.ai_priorite)
  const elapsedTime = getElapsedTime(email.received_at)
  const isNew = email.statut === 'nouveau'
  const toEmailPrefix = email.to_email.split('@')[0]
  const assigneeInitials = email.assigne_a ? getInitials(email.assigne_a) : '—'

  return (
    <div
      onClick={() => onClick(email)}
      className={`
        flex gap-3 p-4 border-b cursor-pointer transition-all
        ${isNew ? 'bg-orange-50' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : 'hover:shadow-md'}
      `}
    >
      {/* Left: Priority score + Urgence */}
      <div className="flex flex-col gap-2 items-center">
        {/* Priority square */}
        <div className={`w-10 h-10 rounded ${priorityColor} flex items-center justify-center text-white font-bold text-sm`}>
          {email.ai_priorite}
        </div>
        {/* Urgence badge */}
        <div className={`text-lg ${urgenceConfig.color}`} title={urgenceConfig.label}>
          {urgenceConfig.emoji}
        </div>
      </div>

      {/* Center: From name + Sentiment, Resume, Category + Keywords */}
      <div className="flex-1 min-w-0">
        {/* From name + Sentiment on same line */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 truncate">{email.from_name}</span>
          <SentimentBadge sentiment={email.ai_sentiment} size="sm" />
        </div>

        {/* Resume */}
        <p className="text-sm text-gray-600 truncate mb-2">{email.ai_resume}</p>

        {/* Category badge + Keywords */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${categorieColorConfig}`}>
            {categorieLabelConfig}
          </span>
          {email.ai_mots_cles.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {email.ai_mots_cles.slice(0, 2).map((keyword, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Elapsed time + To email prefix + Assignee initials */}
      <div className="flex flex-col items-end gap-2 text-xs text-gray-500 whitespace-nowrap">
        {/* Elapsed time */}
        <span className="font-medium">{elapsedTime}</span>

        {/* To email prefix */}
        <span className="text-gray-400">{toEmailPrefix}</span>

        {/* Assignee initials circle */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
          email.assigne_a ? 'bg-indigo-500' : 'bg-gray-300'
        }`}>
          {assigneeInitials}
        </div>
      </div>
    </div>
  )
}
