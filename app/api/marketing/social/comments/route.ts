import { NextRequest, NextResponse } from 'next/server'
import { listComments } from '@/lib/marketing/social'
import type { SocialPlatform, Sentiment, Urgency } from '@/lib/marketing/social'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const platform  = searchParams.get('platform')  as SocialPlatform | null
    const sentiment = searchParams.get('sentiment') as Sentiment | null
    const urgency   = searchParams.get('urgency')   as Urgency | null
    const is_read_param = searchParams.get('is_read')
    const limit     = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const is_read =
      is_read_param === 'true'  ? true  :
      is_read_param === 'false' ? false :
      undefined

    const data = await listComments({
      platform:  platform  ?? undefined,
      sentiment: sentiment ?? undefined,
      urgency:   urgency   ?? undefined,
      is_read,
      limit,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
