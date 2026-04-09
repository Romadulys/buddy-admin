import { NextRequest, NextResponse } from 'next/server'
import { listBacklinks, createBacklink } from '@/lib/marketing/seo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status') as 'active' | 'lost' | null
    const sort   = searchParams.get('sort') as 'quality' | 'first_seen' | 'last_seen' | null
    const limit  = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : undefined
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const data = await listBacklinks({
      status:  status ?? undefined,
      sortBy:  sort ?? undefined,
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
    const { referring_domain, target_url } = body

    if (!referring_domain || !target_url) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : referring_domain, target_url' },
        { status: 400 },
      )
    }

    const created = await createBacklink({
      referring_domain,
      target_url,
      referring_url: body.referring_url ?? null,
      status:        body.status ?? 'active',
      quality_score: body.quality_score ?? 0,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
