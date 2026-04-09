// ============================================================
// Marketing Engine — TypeScript Types
// ============================================================

// ------------------------------------------------------------
// Enums (union types)
// ------------------------------------------------------------

export type ProposalType =
  | 'article'
  | 'social_post'
  | 'ad_campaign'
  | 'seo_fix'
  | 'video_brief'
  | 'image_brief'
  | 'ad_creative'
  | 'report'
  | 'trend_alert'

export type Bloc =
  | 'seo'
  | 'sea'
  | 'social_ads'
  | 'content'
  | 'social_organic'
  | 'analytics'
  | 'trends'
  | 'brand'

export type ProposalSource = 'agent' | 'human'

export type ProposalStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'ready_to_publish'
  | 'published'
  | 'rejected'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type BrandReviewStatus = 'passed' | 'warnings' | 'failed' | 'pending'

export type MemoryType = 'preference' | 'insight' | 'performance' | 'guideline'

export type AgentLogStatus = 'running' | 'success' | 'error'

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'facebook'
  | 'google_ads'
  | 'google_search_console'
  | 'google_analytics'
  | 'google_merchant_center'

// ------------------------------------------------------------
// Interfaces
// ------------------------------------------------------------

export interface BrandReviewCheck {
  rule: string
  passed: boolean
  message?: string
  severity?: 'info' | 'warning' | 'error'
}

export interface Proposal {
  id: string
  type: ProposalType
  bloc: Bloc
  source: ProposalSource
  agent_type: string | null
  status: ProposalStatus
  title: string
  summary: string | null
  content: Record<string, unknown>
  metadata: Record<string, unknown>
  priority: Priority
  brand_review_status: BrandReviewStatus
  brand_review_details: BrandReviewCheck[]
  created_at: string
  updated_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  published_at: string | null
  rejection_reason: string | null
}

export interface AgentMemory {
  id: string
  agent_type: string
  memory_type: MemoryType
  content: Record<string, unknown>
  confidence: number
  source_proposal_id: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface AgentConfig {
  id: string
  agent_type: string
  display_name: string
  description: string | null
  enabled: boolean
  cron_schedule: string
  temperature: number
  last_run_at: string | null
  next_run_at: string | null
  run_count: number
  success_count: number
  error_count: number
  last_error: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PlatformConnection {
  id: string
  platform: Platform
  enabled: boolean
  connected: boolean
  access_token: string | null
  refresh_token: string | null
  account_id: string | null
  account_name: string | null
  token_expires_at: string | null
  connected_at: string | null
  last_sync_at: string | null
  config: Record<string, unknown>
}

export interface AgentLog {
  id: string
  agent_type: string
  status: AgentLogStatus
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  proposals_created: number
  memories_created: number
  error_message: string | null
  details: Record<string, unknown>
}

// ------------------------------------------------------------
// Label / color / icon lookups
// ------------------------------------------------------------

export const BLOC_LABELS: Record<Bloc, string> = {
  seo:            'SEO',
  sea:            'SEA',
  social_ads:     'Social Ads',
  content:        'Contenu',
  social_organic: 'Social Organique',
  analytics:      'Analytics',
  trends:         'Veille',
  brand:          'Marque',
}

export const BLOC_COLORS: Record<Bloc, string> = {
  seo:            'bg-blue-100 text-blue-800',
  sea:            'bg-yellow-100 text-yellow-800',
  social_ads:     'bg-pink-100 text-pink-800',
  content:        'bg-green-100 text-green-800',
  social_organic: 'bg-purple-100 text-purple-800',
  analytics:      'bg-indigo-100 text-indigo-800',
  trends:         'bg-orange-100 text-orange-800',
  brand:          'bg-red-100 text-red-800',
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft:             'Brouillon',
  pending_review:    'En révision',
  approved:          'Approuvé',
  ready_to_publish:  'Prêt à publier',
  published:         'Publié',
  rejected:          'Rejeté',
}

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft:            'bg-gray-100 text-gray-800',
  pending_review:   'bg-yellow-100 text-yellow-800',
  approved:         'bg-green-100 text-green-800',
  ready_to_publish: 'bg-blue-100 text-blue-800',
  published:        'bg-emerald-100 text-emerald-800',
  rejected:         'bg-red-100 text-red-800',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:    'Faible',
  medium: 'Moyen',
  high:   'Élevé',
  urgent: 'Urgent',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low:    'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high:   'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram:              'Instagram',
  tiktok:                 'TikTok',
  youtube:                'YouTube',
  linkedin:               'LinkedIn',
  facebook:               'Facebook',
  google_ads:             'Google Ads',
  google_search_console:  'Search Console',
  google_analytics:       'Google Analytics',
  google_merchant_center: 'Google Merchant',
}

export const PLATFORM_ICONS: Record<Platform, string> = {
  instagram:              'instagram',
  tiktok:                 'music',
  youtube:                'youtube',
  linkedin:               'linkedin',
  facebook:               'facebook',
  google_ads:             'megaphone',
  google_search_console:  'search',
  google_analytics:       'bar-chart-2',
  google_merchant_center: 'shopping-bag',
}

export const AGENT_ICONS: Record<string, string> = {
  'seo-specialist':         'search',
  'content-creator':        'file-text',
  'ppc-strategist':         'trending-up',
  'paid-social-strategist': 'target',
  'social-media-strategist':'share-2',
  'brand-guardian':         'shield',
  'growth-hacker':          'zap',
  'trends-watcher':         'eye',
  'analytics-reporter':     'bar-chart',
}
