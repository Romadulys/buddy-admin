import { NextRequest, NextResponse } from 'next/server'
import { listCreativesByAdSet, listCreatives, createCreative } from '@/lib/marketing/social-ads'

export async function GET(req: NextRequest) {
  try {
    const adsetId = req.nextUrl.searchParams.get('adset_id')
    const data = adsetId
      ? await listCreativesByAdSet(adsetId)
      : await listCreatives()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.ad_set_id || !body.format) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : ad_set_id, format' },
        { status: 400 },
      )
    }

    const created = await createCreative({
      ad_set_id:      body.ad_set_id,
      proposal_id:    body.proposal_id ?? null,
      platform_ad_id: body.platform_ad_id ?? null,
      format:         body.format,
      headline:       body.headline ?? null,
      body:           body.body ?? null,
      cta:            body.cta ?? null,
      media_urls:     body.media_urls ?? [],
      utm_params:     body.utm_params ?? {},
      is_ab_variant:  body.is_ab_variant ?? false,
      ab_group:       body.ab_group ?? null,
      status:         body.status ?? 'draft',
      performance:    body.performance ?? {},
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
