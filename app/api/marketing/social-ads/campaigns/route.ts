import { NextRequest, NextResponse } from 'next/server'
import { listCampaignsByPlatform, listCampaigns, createCampaign } from '@/lib/marketing/social-ads'
import type { SocialPlatform } from '@/lib/marketing/social-ads'

export async function GET(req: NextRequest) {
  try {
    const platform = req.nextUrl.searchParams.get('platform') as SocialPlatform | null
    const data = platform
      ? await listCampaignsByPlatform(platform)
      : await listCampaigns()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.platform || !body.name || !body.objective) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : platform, name, objective' },
        { status: 400 },
      )
    }

    const created = await createCampaign({
      platform:             body.platform,
      platform_campaign_id: body.platform_campaign_id ?? null,
      name:                 body.name,
      objective:            body.objective,
      status:               body.status ?? 'draft',
      daily_budget:         body.daily_budget ?? null,
      weekly_budget:        body.weekly_budget ?? null,
      monthly_budget:       body.monthly_budget ?? null,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
