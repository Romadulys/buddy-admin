import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type SocialPlatform = 'meta' | 'tiktok'
export type CampaignObjective = 'conversions' | 'traffic' | 'reach' | 'engagement' | 'app_install'
export type SocialCampaignStatus = 'draft' | 'ready' | 'active' | 'paused' | 'ended'
export type AdSetStatus = 'draft' | 'active' | 'paused'
export type CreativeFormat = 'image' | 'video' | 'carousel' | 'spark_ad'
export type CreativeStatus = 'draft' | 'pending_review' | 'approved' | 'active' | 'paused'

export interface AudienceConfig {
  type?: string
  interests?: string[]
  age_range?: { min: number; max: number }
  geo?: string[]
  custom_audience_id?: string
  lookalike_pct?: number
}

export interface CreativePerformance {
  impressions?: number
  reach?: number
  clicks?: number
  ctr?: number
  cpc?: number
  conversions?: number
  roas?: number
  frequency?: number
}

export interface SocialAdCampaign {
  id: string
  platform: SocialPlatform
  platform_campaign_id: string | null
  name: string
  objective: CampaignObjective
  status: SocialCampaignStatus
  daily_budget: number | null
  weekly_budget: number | null
  monthly_budget: number | null
  created_at: string
  updated_at: string
}

export interface SocialAdSet {
  id: string
  campaign_id: string | null
  platform_adset_id: string | null
  name: string
  audience: AudienceConfig
  placements: string[]
  budget: number | null
  bid_strategy: string | null
  status: AdSetStatus
  created_at: string
  updated_at: string
}

export interface SocialAdCreative {
  id: string
  ad_set_id: string | null
  proposal_id: string | null
  platform_ad_id: string | null
  format: CreativeFormat
  headline: string | null
  body: string | null
  cta: string | null
  media_urls: string[]
  utm_params: Record<string, string>
  is_ab_variant: boolean
  ab_group: string | null
  status: CreativeStatus
  performance: CreativePerformance
  created_at: string
  updated_at: string
}

export interface CampaignOverview extends SocialAdCampaign {
  ad_set_count: number
}

// ------------------------------------------------------------
// Labels
// ------------------------------------------------------------

export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  conversions: 'Conversions',
  traffic:     'Trafic',
  reach:       'Portee',
  engagement:  'Engagement',
  app_install: 'Installs App',
}

export const OBJECTIVE_ICONS: Record<CampaignObjective, string> = {
  conversions: '🎯',
  traffic:     '🚦',
  reach:       '📡',
  engagement:  '❤️',
  app_install: '📲',
}

export const STATUS_LABELS: Record<SocialCampaignStatus, string> = {
  draft:  'Brouillon',
  ready:  'Pret',
  active: 'Actif',
  paused: 'Pause',
  ended:  'Termine',
}

export const STATUS_STYLES: Record<SocialCampaignStatus, string> = {
  draft:  'bg-slate-100 text-slate-600',
  ready:  'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended:  'bg-slate-200 text-slate-500',
}

// ------------------------------------------------------------
// Campaigns
// ------------------------------------------------------------

export async function listCampaigns(): Promise<SocialAdCampaign[]> {
  const { data, error } = await supabase
    .from('social_ad_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialAdCampaign[]
}

export async function listCampaignsByPlatform(platform: SocialPlatform): Promise<SocialAdCampaign[]> {
  const { data, error } = await supabase
    .from('social_ad_campaigns')
    .select('*')
    .eq('platform', platform)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialAdCampaign[]
}

export async function getCampaign(id: string): Promise<SocialAdCampaign> {
  const { data, error } = await supabase
    .from('social_ad_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialAdCampaign
}

export type CreateCampaignInput = Omit<SocialAdCampaign, 'id' | 'created_at' | 'updated_at'>

export async function createCampaign(input: CreateCampaignInput): Promise<SocialAdCampaign> {
  const { data, error } = await supabase
    .from('social_ad_campaigns')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdCampaign
}

export async function updateCampaign(
  id: string,
  updates: Partial<CreateCampaignInput>,
): Promise<SocialAdCampaign> {
  const { data, error } = await supabase
    .from('social_ad_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdCampaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('social_ad_campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getCampaignOverview(platform?: SocialPlatform): Promise<CampaignOverview[]> {
  let query = supabase
    .from('social_ad_campaigns')
    .select('*, social_ad_sets(id)')
    .order('created_at', { ascending: false })

  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((c: any) => ({
    ...c,
    social_ad_sets: undefined,
    ad_set_count: Array.isArray(c.social_ad_sets) ? c.social_ad_sets.length : 0,
  })) as CampaignOverview[]
}

// ------------------------------------------------------------
// Ad Sets
// ------------------------------------------------------------

export async function listAdSetsByCampaign(campaignId: string): Promise<SocialAdSet[]> {
  const { data, error } = await supabase
    .from('social_ad_sets')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialAdSet[]
}

export async function getAdSet(id: string): Promise<SocialAdSet> {
  const { data, error } = await supabase
    .from('social_ad_sets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialAdSet
}

export type CreateAdSetInput = Omit<SocialAdSet, 'id' | 'created_at' | 'updated_at'>

export async function createAdSet(input: CreateAdSetInput): Promise<SocialAdSet> {
  const { data, error } = await supabase
    .from('social_ad_sets')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdSet
}

export async function updateAdSet(
  id: string,
  updates: Partial<CreateAdSetInput>,
): Promise<SocialAdSet> {
  const { data, error } = await supabase
    .from('social_ad_sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdSet
}

export async function deleteAdSet(id: string): Promise<void> {
  const { error } = await supabase
    .from('social_ad_sets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// Creatives
// ------------------------------------------------------------

export async function listCreativesByAdSet(adSetId: string): Promise<SocialAdCreative[]> {
  const { data, error } = await supabase
    .from('social_ads_creatives')
    .select('*')
    .eq('ad_set_id', adSetId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialAdCreative[]
}

export async function listCreatives(): Promise<SocialAdCreative[]> {
  const { data, error } = await supabase
    .from('social_ads_creatives')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialAdCreative[]
}

export async function getCreative(id: string): Promise<SocialAdCreative> {
  const { data, error } = await supabase
    .from('social_ads_creatives')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialAdCreative
}

export type CreateCreativeInput = Omit<SocialAdCreative, 'id' | 'created_at' | 'updated_at'>

export async function createCreative(input: CreateCreativeInput): Promise<SocialAdCreative> {
  const { data, error } = await supabase
    .from('social_ads_creatives')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdCreative
}

export async function updateCreative(
  id: string,
  updates: Partial<CreateCreativeInput>,
): Promise<SocialAdCreative> {
  const { data, error } = await supabase
    .from('social_ads_creatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialAdCreative
}

export async function deleteCreative(id: string): Promise<void> {
  const { error } = await supabase
    .from('social_ads_creatives')
    .delete()
    .eq('id', id)

  if (error) throw error
}
