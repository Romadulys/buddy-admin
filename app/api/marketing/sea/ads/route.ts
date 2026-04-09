import { NextRequest, NextResponse } from 'next/server'
import { listAdsByAdGroup, createAd } from '@/lib/marketing/sea'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adGroupId = searchParams.get('adgroup_id')

    if (!adGroupId) {
      return NextResponse.json(
        { error: 'Paramètre requis : adgroup_id' },
        { status: 400 },
      )
    }

    const data = await listAdsByAdGroup(adGroupId)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.ad_group_id) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : ad_group_id' },
        { status: 400 },
      )
    }

    const created = await createAd({
      ad_group_id:   body.ad_group_id,
      proposal_id:   body.proposal_id ?? null,
      google_ad_id:  body.google_ad_id ?? null,
      headlines:     body.headlines ?? [],
      descriptions:  body.descriptions ?? [],
      final_url:     body.final_url ?? null,
      extensions:    body.extensions ?? {},
      status:        body.status ?? 'draft',
      performance:   body.performance ?? {},
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
