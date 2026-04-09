import { NextRequest, NextResponse } from 'next/server'
import { listReports, createReport } from '@/lib/marketing/analytics'
import type { ReportType } from '@/lib/marketing/analytics'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type  = searchParams.get('type')  ?? undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const data = await listReports({ type: type as ReportType | undefined, limit })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      proposal_id,
      type,
      period_start,
      period_end,
      content,
      insights,
      recommendations,
    } = body

    if (!type || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : type, period_start, period_end' },
        { status: 400 },
      )
    }

    const report = await createReport({
      proposal_id:     proposal_id     ?? null,
      type,
      period_start,
      period_end,
      content:         content         ?? {},
      insights:        insights        ?? [],
      recommendations: recommendations ?? [],
    })

    return NextResponse.json(report, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
