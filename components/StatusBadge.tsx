'use client'

import {
  ProposalStatus,
  BrandReviewStatus,
  Bloc,
  STATUS_LABELS,
  STATUS_COLORS,
  BLOC_LABELS,
  BLOC_COLORS,
} from '@/lib/marketing/types'

const badgeBase = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={`${badgeBase} ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function BlocBadge({ bloc }: { bloc: Bloc }) {
  return (
    <span className={`${badgeBase} ${BLOC_COLORS[bloc]}`}>
      {BLOC_LABELS[bloc]}
    </span>
  )
}

const BRAND_CONFIG: Record<BrandReviewStatus, { label: string; classes: string }> = {
  passed:   { label: '✅ Brand OK',      classes: 'bg-green-100 text-green-800' },
  warnings: { label: '⚠️ Warnings',      classes: 'bg-amber-100 text-amber-800' },
  failed:   { label: '❌ Non conforme',  classes: 'bg-red-100 text-red-800' },
  pending:  { label: '⏳ En attente',    classes: 'bg-gray-100 text-gray-800' },
}

export function BrandBadge({ status }: { status: BrandReviewStatus }) {
  const { label, classes } = BRAND_CONFIG[status]
  return (
    <span className={`${badgeBase} ${classes}`}>
      {label}
    </span>
  )
}
