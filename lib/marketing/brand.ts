import { supabase } from '@/lib/supabase'

// ============================================================
// Types
// ============================================================

export type GuidelineSection =
  | 'identity'
  | 'colors'
  | 'typography'
  | 'tone'
  | 'vocabulary'
  | 'logos'
  | 'rules'

export interface BrandGuideline {
  id:         string
  section:    GuidelineSection
  content:    Record<string, unknown>
  version:    number
  updated_by: string | null
  updated_at: string
}

export type AssetCategory =
  | 'logo'
  | 'photo'
  | 'illustration'
  | 'template'
  | 'font'
  | 'icon'

export interface BrandAsset {
  id:          string
  category:    AssetCategory
  name:        string
  file_url:    string
  file_type:   string
  file_size:   number | null
  dimensions:  Record<string, unknown> | null
  tags:        string[]
  usage_notes: string | null
  uploaded_at: string
}

// ============================================================
// Guidelines CRUD
// ============================================================

export async function listGuidelines(): Promise<BrandGuideline[]> {
  const { data, error } = await supabase
    .from('brand_guidelines')
    .select('*')
    .order('section')

  if (error) throw error
  return data as BrandGuideline[]
}

export async function getGuideline(section: GuidelineSection): Promise<BrandGuideline | null> {
  const { data, error } = await supabase
    .from('brand_guidelines')
    .select('*')
    .eq('section', section)
    .maybeSingle()

  if (error) throw error
  return data as BrandGuideline | null
}

export async function updateGuideline(
  section: GuidelineSection,
  content: Record<string, unknown>,
): Promise<BrandGuideline> {
  // Increment version and update timestamp atomically via RPC would be ideal,
  // but we do it inline: fetch current version then update.
  const existing = await getGuideline(section)
  const nextVersion = existing ? existing.version + 1 : 1

  const { data, error } = await supabase
    .from('brand_guidelines')
    .update({
      content,
      version:    nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq('section', section)
    .select()
    .single()

  if (error) throw error
  return data as BrandGuideline
}

// ============================================================
// Assets CRUD
// ============================================================

export async function listAssets(category?: AssetCategory): Promise<BrandAsset[]> {
  let query = supabase
    .from('brand_assets')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as BrandAsset[]
}

export async function createAsset(
  asset: Omit<BrandAsset, 'id' | 'uploaded_at'>,
): Promise<BrandAsset> {
  const { data, error } = await supabase
    .from('brand_assets')
    .insert(asset)
    .select()
    .single()

  if (error) throw error
  return data as BrandAsset
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase
    .from('brand_assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================
// Brand context for agent prompts
// ============================================================

export async function getBrandContext(): Promise<string> {
  const guidelines = await listGuidelines()

  if (guidelines.length === 0) {
    return 'Aucune guideline de marque disponible.'
  }

  const sections = guidelines.map((g) => {
    const header = `## ${g.section.toUpperCase()} (v${g.version})`
    const body   = JSON.stringify(g.content, null, 2)
    return `${header}\n${body}`
  })

  return [
    '# Buddy Brand Guidelines',
    `_Generated: ${new Date().toISOString()}_`,
    '',
    ...sections,
  ].join('\n\n')
}
