import { NextRequest, NextResponse } from 'next/server'
import { listSocialPosts, createSocialPost } from '@/lib/marketing/social'
import type { SocialPlatform, SocialPostStatus } from '@/lib/marketing/social'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const platform = searchParams.get('platform') as SocialPlatform | null
    const status   = searchParams.get('status')   as SocialPostStatus | null
    const limit    = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : undefined
    const offset   = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const data = await listSocialPosts({
      platform: platform ?? undefined,
      status:   status   ?? undefined,
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
    const { platform, post_type } = body

    if (!platform || !post_type) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : platform, post_type' },
        { status: 400 },
      )
    }

    const post = await createSocialPost({
      content_item_id:  body.content_item_id  ?? null,
      proposal_id:      body.proposal_id      ?? null,
      platform,
      post_type,
      caption:          body.caption          ?? null,
      hashtags:         body.hashtags         ?? [],
      media_urls:       body.media_urls       ?? [],
      scheduled_for:    body.scheduled_for    ?? null,
      published_at:     body.published_at     ?? null,
      platform_post_id: body.platform_post_id ?? null,
      status:           body.status           ?? 'draft',
      performance:      body.performance      ?? {},
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
