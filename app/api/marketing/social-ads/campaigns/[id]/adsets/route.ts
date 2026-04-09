import { NextRequest, NextResponse } from 'next/server'
import { listAdSetsByCampaign, createAdSet } from '@/lib/marketing/social-ads'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await listAdSetsByCampaign(params.id)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : name' },
        { status: 400 },
      )
    }

    const created = await createAdSet({
      campaign_id:        params.id,
      platform_adset_id:  body.platform_adset_id ?? null,
      name:               body.name,
      audience:           body.audience ?? {},
      placements:         body.placements ?? [],
      budget:             body.budget ?? null,
      bid_strategy:       body.bid_strategy ?? null,
      status:             body.status ?? 'draft',
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
