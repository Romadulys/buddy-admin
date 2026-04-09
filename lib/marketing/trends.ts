import { supabase } from '@/lib/supabase'

// ============================================================
// Types
// ============================================================

export type SignalType = 'keyword_trend' | 'competitor_activity' | 'algo_update' | 'industry_news' | 'seasonal'
export type BuddyImpact = 'direct' | 'adjacent' | 'low' | 'none'
export type CompetitorEventType = 'new_content' | 'new_ad' | 'site_change' | 'new_page' | 'review' | 'price_change'
export type SeasonalRelevance = 'high' | 'medium' | 'low'

export interface TrendSignal {
  id: string
  type: SignalType
  source: string
  title: string
  detail: Record<string, unknown>
  relevance_score: number
  buddy_impact: BuddyImpact
  cascaded_to: string[]
  created_at: string
  expires_at: string | null
}

export interface Competitor {
  id: string
  name: string
  domain: string
  enabled: boolean
  watch_config: Record<string, unknown>
  last_crawled_at: string | null
  created_at: string
}

export interface CompetitorEvent {
  id: string
  competitor_id: string
  type: CompetitorEventType
  title: string
  detail: Record<string, unknown>
  screenshot_url: string | null
  agent_analysis: string | null
  trend_signal_id: string | null
  detected_at: string
}

export interface SeasonalEntry {
  id: string
  month: number
  event: string
  buddy_relevance: SeasonalRelevance
  prep_weeks_before: number
  suggested_actions: string[]
  updated_at: string
}

// ============================================================
// Labels & Colors
// ============================================================

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  keyword_trend:        '📈 Tendance',
  competitor_activity:  '🏢 Concurrent',
  algo_update:          '🔄 Algo',
  industry_news:        '📰 Actu',
  seasonal:             '📅 Saison',
}

export const IMPACT_COLORS: Record<BuddyImpact, string> = {
  direct:   'text-red-600 bg-red-50 border-red-200',
  adjacent: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low:      'text-gray-600 bg-gray-50 border-gray-200',
  none:     'text-slate-400 bg-slate-50 border-slate-200',
}

export const IMPACT_LABELS: Record<BuddyImpact, string> = {
  direct:   '🔴 Direct',
  adjacent: '🟡 Adjacent',
  low:      '⚪ Faible',
  none:     '— Aucun',
}

export const EVENT_TYPE_ICONS: Record<CompetitorEventType, string> = {
  new_content:  '📝',
  new_ad:       '📢',
  site_change:  '🔄',
  new_page:     '📄',
  review:       '⭐',
  price_change: '💰',
}

export const SEASONAL_RELEVANCE_BADGES: Record<SeasonalRelevance, string> = {
  high:   '🔥',
  medium: '🟡',
  low:    '⚪',
}

export const SEASONAL_RELEVANCE_COLORS: Record<SeasonalRelevance, string> = {
  high:   'text-red-600 bg-red-50',
  medium: 'text-yellow-700 bg-yellow-50',
  low:    'text-gray-500 bg-gray-50',
}

// ============================================================
// Signal helpers
// ============================================================

export interface ListSignalsFilters {
  type?: SignalType
  buddy_impact?: BuddyImpact
  limit?: number
}

export async function listSignals(filters: ListSignalsFilters = {}): Promise<TrendSignal[]> {
  const { type, buddy_impact, limit = 50 } = filters

  let query = supabase
    .from('trend_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type)         query = query.eq('type', type)
  if (buddy_impact) query = query.eq('buddy_impact', buddy_impact)

  const { data, error } = await query
  if (error) throw error
  return data as TrendSignal[]
}

export type CreateSignalInput = Omit<TrendSignal, 'id' | 'created_at'>

export async function createSignal(signal: CreateSignalInput): Promise<TrendSignal> {
  const { data, error } = await supabase
    .from('trend_signals')
    .insert(signal)
    .select()
    .single()
  if (error) throw error
  return data as TrendSignal
}

export async function getSignal(id: string): Promise<TrendSignal> {
  const { data, error } = await supabase
    .from('trend_signals')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as TrendSignal
}

// ============================================================
// Competitor helpers
// ============================================================

export async function listCompetitors(): Promise<Competitor[]> {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Competitor[]
}

export type CreateCompetitorInput = Omit<Competitor, 'id' | 'created_at'>

export async function createCompetitor(comp: CreateCompetitorInput): Promise<Competitor> {
  const { data, error } = await supabase
    .from('competitors')
    .insert(comp)
    .select()
    .single()
  if (error) throw error
  return data as Competitor
}

export async function updateCompetitor(id: string, updates: Partial<Competitor>): Promise<Competitor> {
  const { data, error } = await supabase
    .from('competitors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Competitor
}

export async function deleteCompetitor(id: string): Promise<void> {
  const { error } = await supabase
    .from('competitors')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ============================================================
// Competitor event helpers
// ============================================================

export async function listCompetitorEvents(competitorId?: string, limit = 50): Promise<CompetitorEvent[]> {
  let query = supabase
    .from('competitor_events')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(limit)

  if (competitorId) query = query.eq('competitor_id', competitorId)

  const { data, error } = await query
  if (error) throw error
  return data as CompetitorEvent[]
}

export type CreateCompetitorEventInput = Omit<CompetitorEvent, 'id' | 'detected_at'>

export async function createCompetitorEvent(event: CreateCompetitorEventInput): Promise<CompetitorEvent> {
  const { data, error } = await supabase
    .from('competitor_events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data as CompetitorEvent
}

// ============================================================
// Seasonal calendar helpers
// ============================================================

export async function listSeasonalCalendar(): Promise<SeasonalEntry[]> {
  const { data, error } = await supabase
    .from('seasonal_calendar')
    .select('*')
    .order('month', { ascending: true })
  if (error) throw error
  return data as SeasonalEntry[]
}

export async function updateSeasonalEntry(id: string, updates: Partial<SeasonalEntry>): Promise<SeasonalEntry> {
  const payload = { ...updates, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('seasonal_calendar')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SeasonalEntry
}

export async function getUpcomingSeasons(monthsAhead = 3): Promise<SeasonalEntry[]> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12

  const months: number[] = []
  for (let i = 0; i < monthsAhead; i++) {
    months.push(((currentMonth - 1 + i) % 12) + 1)
  }

  const { data, error } = await supabase
    .from('seasonal_calendar')
    .select('*')
    .in('month', months)
    .order('month', { ascending: true })

  if (error) throw error

  // Sort by proximity to current month, wrapping around year boundary
  const sorted = (data as SeasonalEntry[]).sort((a, b) => {
    const distA = (a.month - currentMonth + 12) % 12
    const distB = (b.month - currentMonth + 12) % 12
    return distA - distB
  })

  return sorted
}
