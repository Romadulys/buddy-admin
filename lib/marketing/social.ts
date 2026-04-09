import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook'

export type PostType = 'image' | 'video' | 'carousel' | 'reel' | 'story' | 'short' | 'text'

export type SocialPostStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'

export type Sentiment = 'positive' | 'negative' | 'neutral' | 'question'

export type Urgency = 'low' | 'medium' | 'high'

export interface SocialPost {
  id: string
  content_item_id: string | null
  proposal_id: string | null
  platform: SocialPlatform
  post_type: PostType
  caption: string | null
  hashtags: string[]
  media_urls: string[]
  scheduled_for: string | null
  published_at: string | null
  platform_post_id: string | null
  status: SocialPostStatus
  performance: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SocialComment {
  id: string
  platform: SocialPlatform
  platform_comment_id: string | null
  post_id: string | null
  author_name: string | null
  author_handle: string | null
  body: string
  sentiment: Sentiment
  is_read: boolean
  replied: boolean
  reply_text: string | null
  replied_at: string | null
  urgency: Urgency
  created_at: string
}

// ------------------------------------------------------------
// Label / icon / color maps
// ------------------------------------------------------------

export const POST_TYPE_LABELS: Record<PostType, string> = {
  image:    'Image',
  video:    'Video',
  carousel: 'Carrousel',
  reel:     'Reel',
  story:    'Story',
  short:    'Short',
  text:     'Texte',
}

export const POST_TYPE_ICONS: Record<PostType, string> = {
  image:    '🖼️',
  video:    '🎥',
  carousel: '📑',
  reel:     '🎬',
  story:    '⏱️',
  short:    '📱',
  text:     '✍️',
}

export const SOCIAL_STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft:          'Brouillon',
  pending_review: 'En attente',
  approved:       'Approuve',
  scheduled:      'Programme',
  published:      'Publie',
  failed:         'Echoue',
}

export const SOCIAL_STATUS_COLORS: Record<SocialPostStatus, string> = {
  draft:          'bg-gray-100 text-gray-700',
  pending_review: 'bg-amber-100 text-amber-800',
  approved:       'bg-blue-100 text-blue-800',
  scheduled:      'bg-purple-100 text-purple-800',
  published:      'bg-green-100 text-green-800',
  failed:         'bg-red-100 text-red-800',
}

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: 'Positif',
  negative: 'Negatif',
  neutral:  'Neutre',
  question: 'Question',
}

export const SENTIMENT_ICONS: Record<Sentiment, string> = {
  positive: '😊',
  negative: '😞',
  neutral:  '😐',
  question: '❓',
}

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  neutral:  'bg-gray-100 text-gray-700',
  question: 'bg-blue-100 text-blue-800',
}

// ------------------------------------------------------------
// Posts — list / get / create / update / delete
// ------------------------------------------------------------

export interface ListSocialPostsFilters {
  platform?: SocialPlatform
  status?: SocialPostStatus
  limit?: number
  offset?: number
}

export async function listSocialPosts(
  filters: ListSocialPostsFilters = {},
): Promise<SocialPost[]> {
  const { platform, status, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('social_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (platform) query = query.eq('platform', platform)
  if (status)   query = query.eq('status', status)

  const { data, error } = await query

  if (error) throw error
  return data as SocialPost[]
}

export async function getSocialPost(id: string): Promise<SocialPost> {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialPost
}

export type CreateSocialPostInput = Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>

export async function createSocialPost(
  post: CreateSocialPostInput,
): Promise<SocialPost> {
  const { data, error } = await supabase
    .from('social_posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data as SocialPost
}

export async function updateSocialPost(
  id: string,
  updates: Partial<Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>>,
): Promise<SocialPost> {
  const { data, error } = await supabase
    .from('social_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialPost
}

export async function deleteSocialPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('social_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ------------------------------------------------------------
// listPostsByPlatform — platform-specific view
// ------------------------------------------------------------

export async function listPostsByPlatform(platform: SocialPlatform): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('platform', platform)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialPost[]
}

// ------------------------------------------------------------
// getPostPerformance — aggregate stats
// ------------------------------------------------------------

export interface PostPerformanceStats {
  total_posts: number
  avg_engagement: number
  total_reach: number
}

export async function getPostPerformance(
  platform?: SocialPlatform,
): Promise<PostPerformanceStats> {
  let query = supabase
    .from('social_posts')
    .select('performance')
    .eq('status', 'published')

  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query

  if (error) throw error

  const posts = (data ?? []) as Array<{ performance: Record<string, unknown> }>
  const total_posts = posts.length

  let total_reach = 0
  let total_engagement_rate = 0

  for (const post of posts) {
    const perf = post.performance ?? {}
    total_reach += Number(perf.reach ?? 0)
    total_engagement_rate += Number(perf.engagement_rate ?? 0)
  }

  const avg_engagement = total_posts > 0 ? total_engagement_rate / total_posts : 0

  return { total_posts, avg_engagement, total_reach }
}

// ------------------------------------------------------------
// Comments — list / get / update
// ------------------------------------------------------------

export interface ListCommentsFilters {
  platform?: SocialPlatform
  is_read?: boolean
  sentiment?: Sentiment
  urgency?: Urgency
  limit?: number
}

export async function listComments(
  filters: ListCommentsFilters = {},
): Promise<SocialComment[]> {
  const { platform, is_read, sentiment, urgency, limit = 50 } = filters

  let query = supabase
    .from('social_comments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (platform  !== undefined) query = query.eq('platform', platform)
  if (is_read   !== undefined) query = query.eq('is_read', is_read)
  if (sentiment !== undefined) query = query.eq('sentiment', sentiment)
  if (urgency   !== undefined) query = query.eq('urgency', urgency)

  const { data, error } = await query

  if (error) throw error
  return data as SocialComment[]
}

export async function getComment(id: string): Promise<SocialComment> {
  const { data, error } = await supabase
    .from('social_comments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SocialComment
}

export async function updateComment(
  id: string,
  updates: Partial<Omit<SocialComment, 'id' | 'created_at'>>,
): Promise<SocialComment> {
  const { data, error } = await supabase
    .from('social_comments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SocialComment
}

// ------------------------------------------------------------
// getCommentStats
// ------------------------------------------------------------

export interface CommentStats {
  total: number
  unread: number
  by_sentiment: Record<Sentiment, number>
  by_platform: Record<string, number>
}

export async function getCommentStats(): Promise<CommentStats> {
  const { data, error } = await supabase
    .from('social_comments')
    .select('is_read, sentiment, platform')

  if (error) throw error

  const rows = (data ?? []) as Array<{
    is_read: boolean
    sentiment: Sentiment
    platform: string
  }>

  const stats: CommentStats = {
    total:        rows.length,
    unread:       rows.filter(r => !r.is_read).length,
    by_sentiment: { positive: 0, negative: 0, neutral: 0, question: 0 },
    by_platform:  {},
  }

  for (const row of rows) {
    stats.by_sentiment[row.sentiment] = (stats.by_sentiment[row.sentiment] ?? 0) + 1
    stats.by_platform[row.platform]   = (stats.by_platform[row.platform]   ?? 0) + 1
  }

  return stats
}

// ------------------------------------------------------------
// getUnrepliedComments
// ------------------------------------------------------------

export async function getUnrepliedComments(limit = 20): Promise<SocialComment[]> {
  const { data, error } = await supabase
    .from('social_comments')
    .select('*')
    .eq('replied', false)
    .order('urgency',    { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as SocialComment[]
}
