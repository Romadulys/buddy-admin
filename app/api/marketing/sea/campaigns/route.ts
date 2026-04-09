import { NextRequest, NextResponse } from 'next/server'
import { listCampaigns, createCampaign } from '@/lib/marketing/sea'

export async function GET() {
  try {
    const data = await listCampaigns()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : name, type' },
        { status: 400 },
      )
    }

    const created = await createCampaign({
      google_campaign_id: body.google_campaign_id ?? null,
      name:               body.name,
      type:               body.type,
      status:             body.status ?? 'draft',
      daily_budget:       body.daily_budget ?? null,
      weekly_budget:      body.weekly_budget ?? null,
      monthly_budget:     body.monthly_budget ?? null,
      target_roas:        body.target_roas ?? null,
      start_date:         body.start_date ?? null,
      end_date:           body.end_date ?? null,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
