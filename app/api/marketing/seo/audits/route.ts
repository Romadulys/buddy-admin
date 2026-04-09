import { NextRequest, NextResponse } from 'next/server'
import { listAudits, createAudit } from '@/lib/marketing/seo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const data = await listAudits(limit)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { health_score } = body

    if (health_score === undefined || health_score === null) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : health_score' },
        { status: 400 },
      )
    }

    const created = await createAudit({
      health_score,
      issues:            body.issues ?? [],
      core_web_vitals:   body.core_web_vitals ?? {},
      pages_indexed:     body.pages_indexed ?? 0,
      pages_with_errors: body.pages_with_errors ?? 0,
      previous_audit_id: body.previous_audit_id ?? null,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
