import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface SeoKeyword {
  id: string
  keyword: string
  cluster: string | null
  current_position: number | null
  previous_position: number | null
  impressions: number
  clicks: number
  ctr: number
  search_volume_estimate: number | null
  opportunity_score: number
  tracked_since: string
  last_updated: string
}

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'info'
  type: string
  url: string
  description: string
  fix_suggestion: string
}

export interface SeoAudit {
  id: string
  audit_date: string
  health_score: number
  issues: AuditIssue[]
  core_web_vitals: Record<string, unknown>
  pages_indexed: number
  pages_with_errors: number
  previous_audit_id: string | null
}

export interface SeoBacklink {
  id: string
  referring_domain: string
  referring_url: string | null
  target_url: string
  first_seen: string
  last_seen: string
  status: 'active' | 'lost'
  quality_score: number
}

// ------------------------------------------------------------
// Keywords
// ------------------------------------------------------------

export interface ListKeywordsFilters {
  cluster?: string
  sortBy?: 'position' | 'opportunity' | 'impressions'
  limit?: number
  offset?: number
}

export async function listKeywords(filters: ListKeywordsFilters = {}): Promise<SeoKeyword[]> {
  const { cluster, sortBy = 'opportunity', limit = 50, offset = 0 } = filters

  const sortColumn =
    sortBy === 'position'    ? 'current_position' :
    sortBy === 'impressions' ? 'impressions'       :
                               'opportunity_score'

  const ascending = sortBy === 'position'

  let query = supabase
    .from('seo_keywords')
    .select('*')
    .order(sortColumn, { ascending })
    .range(offset, offset + limit - 1)

  if (cluster) query = query.eq('cluster', cluster)

  const { data, error } = await query
  if (error) throw error
  return data as SeoKeyword[]
}

export async function getKeyword(id: string): Promise<SeoKeyword> {
  const { data, error } = await supabase
    .from('seo_keywords')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SeoKeyword
}

export type CreateKeywordInput = Omit<SeoKeyword, 'id' | 'tracked_since' | 'last_updated'>

export async function createKeyword(keyword: CreateKeywordInput): Promise<SeoKeyword> {
  const { data, error } = await supabase
    .from('seo_keywords')
    .insert(keyword)
    .select()
    .single()

  if (error) throw error
  return data as SeoKeyword
}

export async function updateKeyword(
  id: string,
  updates: Partial<CreateKeywordInput>,
): Promise<SeoKeyword> {
  const { data, error } = await supabase
    .from('seo_keywords')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SeoKeyword
}

export async function deleteKeyword(id: string): Promise<void> {
  const { error } = await supabase
    .from('seo_keywords')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getKeywordClusters(): Promise<{ cluster: string | null; count: number }[]> {
  const { data, error } = await supabase
    .from('seo_keywords')
    .select('cluster')

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const key = row.cluster ?? '__null__'
    counts[key] = (counts[key] ?? 0) + 1
  }

  return Object.entries(counts).map(([cluster, count]) => ({
    cluster: cluster === '__null__' ? null : cluster,
    count,
  }))
}

// ------------------------------------------------------------
// Audits
// ------------------------------------------------------------

export async function listAudits(limit = 20): Promise<SeoAudit[]> {
  const { data, error } = await supabase
    .from('seo_audits')
    .select('*')
    .order('audit_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as SeoAudit[]
}

export async function getAudit(id: string): Promise<SeoAudit> {
  const { data, error } = await supabase
    .from('seo_audits')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SeoAudit
}

export type CreateAuditInput = Omit<SeoAudit, 'id' | 'audit_date'>

export async function createAudit(audit: CreateAuditInput): Promise<SeoAudit> {
  const { data, error } = await supabase
    .from('seo_audits')
    .insert(audit)
    .select()
    .single()

  if (error) throw error
  return data as SeoAudit
}

export async function getLatestAudit(): Promise<SeoAudit | null> {
  const { data, error } = await supabase
    .from('seo_audits')
    .select('*')
    .order('audit_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as SeoAudit | null
}

// ------------------------------------------------------------
// Backlinks
// ------------------------------------------------------------

export interface ListBacklinksFilters {
  status?: 'active' | 'lost'
  sortBy?: 'quality' | 'first_seen' | 'last_seen'
  limit?: number
  offset?: number
}

export async function listBacklinks(filters: ListBacklinksFilters = {}): Promise<SeoBacklink[]> {
  const { status, sortBy = 'quality', limit = 50, offset = 0 } = filters

  const sortColumn =
    sortBy === 'first_seen' ? 'first_seen' :
    sortBy === 'last_seen'  ? 'last_seen'  :
                              'quality_score'

  let query = supabase
    .from('seo_backlinks')
    .select('*')
    .order(sortColumn, { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as SeoBacklink[]
}

export type CreateBacklinkInput = Omit<SeoBacklink, 'id' | 'first_seen' | 'last_seen'>

export async function createBacklink(backlink: CreateBacklinkInput): Promise<SeoBacklink> {
  const { data, error } = await supabase
    .from('seo_backlinks')
    .insert(backlink)
    .select()
    .single()

  if (error) throw error
  return data as SeoBacklink
}

export async function updateBacklink(
  id: string,
  updates: Partial<CreateBacklinkInput> & { last_seen?: string },
): Promise<SeoBacklink> {
  const { data, error } = await supabase
    .from('seo_backlinks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SeoBacklink
}

export interface BacklinkStats {
  total: number
  active: number
  lost: number
  new_this_week: number
}

export async function getBacklinkStats(): Promise<BacklinkStats> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('seo_backlinks')
    .select('status, first_seen')

  if (error) throw error

  const rows = data ?? []
  const total = rows.length
  const active = rows.filter(r => r.status === 'active').length
  const lost = rows.filter(r => r.status === 'lost').length
  const new_this_week = rows.filter(r => r.first_seen >= oneWeekAgo).length

  return { total, active, lost, new_this_week }
}
