import { NextRequest, NextResponse } from 'next/server'
import { listAdGroupsByCampaign, createAdGroup } from '@/lib/marketing/sea'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await listAdGroupsByCampaign(params.id)
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

    const created = await createAdGroup({
      campaign_id:        params.id,
      google_adgroup_id:  body.google_adgroup_id ?? null,
      name:               body.name,
      keywords:           body.keywords ?? [],
      negative_keywords:  body.negative_keywords ?? [],
      status:             body.status ?? 'draft',
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
