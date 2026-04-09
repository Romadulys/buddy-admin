import { NextRequest, NextResponse } from 'next/server'
import { listContentItems, createContentItem } from '@/lib/marketing/content'
import type { ContentType, ContentStatus } from '@/lib/marketing/content'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type   = searchParams.get('type')   as ContentType | null
    const status = searchParams.get('status') as ContentStatus | null
    const limit  = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : undefined
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const data = await listContentItems({
      type:   type   ?? undefined,
      status: status ?? undefined,
      limit,
      offset,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, title } = body

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : type, title' },
        { status: 400 },
      )
    }

    const item = await createContentItem({
      proposal_id:       body.proposal_id       ?? null,
      type,
      title,
      body:              body.body              ?? {},
      seo_data:          body.seo_data          ?? {},
      target_channels:   body.target_channels   ?? [],
      parent_content_id: body.parent_content_id ?? null,
      status:            body.status            ?? 'draft',
      scheduled_for:     body.scheduled_for     ?? null,
      published_at:      body.published_at      ?? null,
      published_url:     body.published_url     ?? null,
      performance:       body.performance       ?? {},
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
