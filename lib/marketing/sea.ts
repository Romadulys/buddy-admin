import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type CampaignType = 'search' | 'shopping' | 'pmax' | 'youtube' | 'remarketing' | 'display'
export type CampaignStatus = 'draft' | 'ready' | 'active' | 'paused' | 'ended'
export type AdGroupStatus = 'draft' | 'active' | 'paused'
export type AdStatus = 'draft' | 'pending_review' | 'approved' | 'active' | 'paused'
export type BudgetScope = 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'global'

export interface SeaCampaign {
  id: string
  google_campaign_id: string | null
  name: string
  type: CampaignType
  status: CampaignStatus
  daily_budget: number | null
  weekly_budget: number | null
  monthly_budget: number | null
  target_roas: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface KeywordEntry {
  keyword: string
  match_type: 'broad' | 'phrase' | 'exact'
  cpc_max: number | null
  quality_score: number | null
}

export interface SeaAdGroup {
  id: string
  campaign_id: string | null
  google_adgroup_id: string | null
  name: string
  keywords: KeywordEntry[]
  negative_keywords: string[]
  status: AdGroupStatus
  created_at: string
  updated_at: string
}

export interface AdPerformance {
  impressions?: number
  clicks?: number
  ctr?: number
  conversions?: number
  cost?: number
  roas?: number
}

export interface SeaAd {
  id: string
  ad_group_id: string | null
  proposal_id: string | null
  google_ad_id: string | null
  headlines: string[]
  descriptions: string[]
  final_url: string | null
  extensions: Record<string, unknown>
  status: AdStatus
  performance: AdPerformance
  created_at: string
  updated_at: string
}

export interface SeaBudgetSnapshot {
  id: string
  date: string
  total_spend: number
  by_campaign: Record<string, { spend: number; clicks: number; conversions: number; roas: number }>
  alerts: string[]
  created_at: string
}

export interface AdBudgetLimit {
  id: string
  scope: BudgetScope
  daily_limit: number | null
  weekly_limit: number | null
  monthly_limit: number | null
  alert_thresholds: number[]
  auto_pause: boolean
  updated_at: string
}

// ------------------------------------------------------------
// Labels & Icons
// ------------------------------------------------------------

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  search:      'Search',
  shopping:    'Shopping',
  pmax:        'Performance Max',
  youtube:     'YouTube Ads',
  remarketing: 'Remarketing',
  display:     'Display',
}

export const CAMPAIGN_TYPE_ICONS: Record<CampaignType, string> = {
  search:      '🔍',
  shopping:    '🛒',
  pmax:        '🎯',
  youtube:     '📺',
  remarketing: '🔄',
  display:     '🖼️',
}

// ------------------------------------------------------------
// Campaigns
// ------------------------------------------------------------

export async function listCampaigns(): Promise<SeaCampaign[]> {
  const { data, error } = await supabase
    .from('sea_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SeaCampaign[]
}

export async function getCampaign(id: string): Promise<SeaCampaign> {
  const { data, error } = await supabase
    .from('sea_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SeaCampaign
}

export type CreateCampaignInput = Omit<SeaCampaign, 'id' | 'created_at' | 'updated_at'>

export async function createCampaign(input: CreateCampaignInput): Promise<SeaCampaign> {
  const { data, error } = await supabase
    .from('sea_campaigns')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SeaCampaign
}

export async function updateCampaign(
  id: string,
  updates: Partial<CreateCampaignInput>,
): Promise<SeaCampaign> {
  const { data, error } = await supabase
    .from('sea_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SeaCampaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('sea_campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// Ad Groups
// ------------------------------------------------------------

export async function listAdGroupsByCampaign(campaignId: string): Promise<SeaAdGroup[]> {
  const { data, error } = await supabase
    .from('sea_ad_groups')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SeaAdGroup[]
}

export async function getAdGroup(id: string): Promise<SeaAdGroup> {
  const { data, error } = await supabase
    .from('sea_ad_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SeaAdGroup
}

export type CreateAdGroupInput = Omit<SeaAdGroup, 'id' | 'created_at' | 'updated_at'>

export async function createAdGroup(input: CreateAdGroupInput): Promise<SeaAdGroup> {
  const { data, error } = await supabase
    .from('sea_ad_groups')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SeaAdGroup
}

export async function updateAdGroup(
  id: string,
  updates: Partial<CreateAdGroupInput>,
): Promise<SeaAdGroup> {
  const { data, error } = await supabase
    .from('sea_ad_groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SeaAdGroup
}

export async function deleteAdGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('sea_ad_groups')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// Ads
// ------------------------------------------------------------

export async function listAdsByAdGroup(adGroupId: string): Promise<SeaAd[]> {
  const { data, error } = await supabase
    .from('sea_ads')
    .select('*')
    .eq('ad_group_id', adGroupId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SeaAd[]
}

export async function getAd(id: string): Promise<SeaAd> {
  const { data, error } = await supabase
    .from('sea_ads')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SeaAd
}

export type CreateAdInput = Omit<SeaAd, 'id' | 'created_at' | 'updated_at'>

export async function createAd(input: CreateAdInput): Promise<SeaAd> {
  const { data, error } = await supabase
    .from('sea_ads')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SeaAd
}

export async function updateAd(
  id: string,
  updates: Partial<CreateAdInput>,
): Promise<SeaAd> {
  const { data, error } = await supabase
    .from('sea_ads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SeaAd
}

export async function deleteAd(id: string): Promise<void> {
  const { error } = await supabase
    .from('sea_ads')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// Budget
// ------------------------------------------------------------

export async function listBudgetSnapshots(limit = 30): Promise<SeaBudgetSnapshot[]> {
  const { data, error } = await supabase
    .from('sea_budget_snapshots')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as SeaBudgetSnapshot[]
}

export type CreateBudgetSnapshotInput = Omit<SeaBudgetSnapshot, 'id' | 'created_at'>

export async function createBudgetSnapshot(
  input: CreateBudgetSnapshotInput,
): Promise<SeaBudgetSnapshot> {
  const { data, error } = await supabase
    .from('sea_budget_snapshots')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SeaBudgetSnapshot
}

export async function getBudgetLimits(scope?: BudgetScope): Promise<AdBudgetLimit[]> {
  let query = supabase
    .from('ad_budget_limits')
    .select('*')
    .order('scope')

  if (scope) query = query.eq('scope', scope)

  const { data, error } = await query
  if (error) throw error
  return data as AdBudgetLimit[]
}

export type UpdateBudgetLimitInput = Partial<
  Pick<AdBudgetLimit, 'daily_limit' | 'weekly_limit' | 'monthly_limit' | 'alert_thresholds' | 'auto_pause'>
>

export async function updateBudgetLimit(
  scope: BudgetScope,
  updates: UpdateBudgetLimitInput,
): Promise<AdBudgetLimit> {
  const { data, error } = await supabase
    .from('ad_budget_limits')
    .update(updates)
    .eq('scope', scope)
    .select()
    .single()

  if (error) throw error
  return data as AdBudgetLimit
}

// ------------------------------------------------------------
// Overview
// ------------------------------------------------------------

export interface CampaignOverview extends SeaCampaign {
  ad_group_count: number
  total_spend: number
}

export async function getCampaignOverview(): Promise<CampaignOverview[]> {
  const { data: campaigns, error: campErr } = await supabase
    .from('sea_campaigns')
    .select('*, sea_ad_groups(id)')
    .order('created_at', { ascending: false })

  if (campErr) throw campErr

  // Fetch latest budget snapshot for spend data
  const { data: snapshots, error: snapErr } = await supabase
    .from('sea_budget_snapshots')
    .select('by_campaign')
    .order('date', { ascending: false })
    .limit(1)

  if (snapErr) throw snapErr

  const spendMap: Record<string, number> =
    snapshots && snapshots.length > 0
      ? Object.fromEntries(
          Object.entries(
            snapshots[0].by_campaign as Record<string, { spend: number }>,
          ).map(([cid, v]) => [cid, v.spend ?? 0]),
        )
      : {}

  return (campaigns ?? []).map((c: any) => ({
    ...c,
    sea_ad_groups: undefined,
    ad_group_count: Array.isArray(c.sea_ad_groups) ? c.sea_ad_groups.length : 0,
    total_spend: spendMap[c.id] ?? 0,
  })) as CampaignOverview[]
}
