'use client'

import { Proposal, AGENT_ICONS } from '@/lib/marketing/types'
import { StatusBadge, BlocBadge, BrandBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'

interface ProposalCardProps {
  proposal: Proposal
  selected: boolean
  onClick: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export default function ProposalCard({ proposal, selected, onClick }: ProposalCardProps) {
  const isAgent = proposal.source === 'agent'
  const agentIcon = isAgent && proposal.agent_type ? AGENT_ICONS[proposal.agent_type] || '🤖' : '👤'

  return (
    <div
      onClick={onClick}
      className={`relative flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 ${
        selected
          ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Agent icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg">
        {isAgent ? '🤖' : '👤'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{proposal.title}</p>
        {proposal.summary && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{proposal.summary}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          <BlocBadge bloc={proposal.bloc} />
          <StatusBadge status={proposal.status} />
          <PriorityBadge priority={proposal.priority} />
          {proposal.status !== 'pending_review' && (
            <BrandBadge status={proposal.brand_review_status} />
          )}
        </div>
      </div>

      {/* Time */}
      <div className="flex-shrink-0 text-xs text-slate-400 mt-0.5">
        {timeAgo(proposal.created_at)}
      </div>
    </div>
  )
}
