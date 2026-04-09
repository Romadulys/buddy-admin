import { NextRequest, NextResponse } from 'next/server'
import { listKeywords, createKeyword } from '@/lib/marketing/seo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const cluster = searchParams.get('cluster') ?? undefined
    const sort    = searchParams.get('sort') as 'position' | 'opportunity' | 'impressions' | null
    const limit   = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : undefined
    const offset  = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const data = await listKeywords({
      cluster,
      sortBy: sort ?? undefined,
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
    const { keyword } = body

    if (!keyword) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : keyword' },
        { status: 400 },
      )
    }

    const created = await createKeyword({
      keyword,
      cluster:                body.cluster ?? null,
      current_position:       body.current_position ?? null,
      previous_position:      body.previous_position ?? null,
      impressions:            body.impressions ?? 0,
      clicks:                 body.clicks ?? 0,
      ctr:                    body.ctr ?? 0,
      search_volume_estimate: body.search_volume_estimate ?? null,
      opportunity_score:      body.opportunity_score ?? 0,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
