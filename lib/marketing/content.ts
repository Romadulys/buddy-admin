import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type ContentType =
  | 'article'
  | 'social_post'
  | 'video_brief'
  | 'image_brief'
  | 'video_script'
  | 'ad_creative'
  | 'email'

export type ContentStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'

export interface ContentItem {
  id: string
  proposal_id: string | null
  type: ContentType
  title: string
  body: Record<string, unknown>
  seo_data: Record<string, unknown>
  target_channels: string[]
  parent_content_id: string | null
  status: ContentStatus
  scheduled_for: string | null
  published_at: string | null
  published_url: string | null
  performance: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Label / icon / color maps (French)
// ------------------------------------------------------------

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article:      'Article',
  social_post:  'Post social',
  video_brief:  'Brief video',
  image_brief:  'Brief image',
  video_script: 'Script video',
  ad_creative:  'Creative pub',
  email:        'Email',
}

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  article:      '📄',
  social_post:  '📱',
  video_brief:  '🎬',
  image_brief:  '🖼️',
  video_script: '🎥',
  ad_creative:  '📢',
  email:        '✉️',
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft:     'Brouillon',
  review:    'En review',
  approved:  'Approuve',
  scheduled: 'Programme',
  published: 'Publie',
}

export const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
  draft:     'bg-gray-100 text-gray-700',
  review:    'bg-amber-100 text-amber-800',
  approved:  'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  published: 'bg-green-100 text-green-800',
}

// ------------------------------------------------------------
// Filters
// ------------------------------------------------------------

export interface ListContentItemsFilters {
  type?: ContentType
  status?: ContentStatus
  limit?: number
  offset?: number
}

// ------------------------------------------------------------
// listContentItems
// ------------------------------------------------------------

export async function listContentItems(
  filters: ListContentItemsFilters = {},
): Promise<ContentItem[]> {
  const { type, status, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type)   query = query.eq('type', type)
  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) throw error
  return data as ContentItem[]
}

// ------------------------------------------------------------
// getContentItem
// ------------------------------------------------------------

export async function getContentItem(id: string): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ContentItem
}

// ------------------------------------------------------------
// createContentItem
// ------------------------------------------------------------

export type CreateContentItemInput = Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>

export async function createContentItem(
  item: CreateContentItemInput,
): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

// ------------------------------------------------------------
// updateContentItem
// ------------------------------------------------------------

export async function updateContentItem(
  id: string,
  updates: Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>,
): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ContentItem
}

// ------------------------------------------------------------
// deleteContentItem
// ------------------------------------------------------------

export async function deleteContentItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// listContentByMonth
// ------------------------------------------------------------

export async function listContentByMonth(
  year: number,
  month: number,
): Promise<ContentItem[]> {
  const from = new Date(year, month - 1, 1).toISOString()
  const to   = new Date(year, month, 1).toISOString()

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .gte('scheduled_for', from)
    .lt('scheduled_for', to)
    .order('scheduled_for', { ascending: true })

  if (error) throw error
  return data as ContentItem[]
}

// ------------------------------------------------------------
// getRepurposedContent
// ------------------------------------------------------------

export async function getRepurposedContent(parentId: string): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('parent_content_id', parentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ContentItem[]
}

// ------------------------------------------------------------
// linkAsset
// ------------------------------------------------------------

export async function linkAsset(
  contentItemId: string,
  brandAssetId: string,
): Promise<void> {
  const { error } = await supabase
    .from('content_item_assets')
    .insert({ content_item_id: contentItemId, brand_asset_id: brandAssetId })

  if (error) throw error
}

// ------------------------------------------------------------
// unlinkAsset
// ------------------------------------------------------------

export async function unlinkAsset(
  contentItemId: string,
  brandAssetId: string,
): Promise<void> {
  const { error } = await supabase
    .from('content_item_assets')
    .delete()
    .eq('content_item_id', contentItemId)
    .eq('brand_asset_id', brandAssetId)

  if (error) throw error
}

// ------------------------------------------------------------
// getContentAssets
// ------------------------------------------------------------

export async function getContentAssets(contentItemId: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('brand_assets')
    .select('*, content_item_assets!inner(content_item_id)')
    .eq('content_item_assets.content_item_id', contentItemId)

  if (error) throw error
  return data ?? []
}
