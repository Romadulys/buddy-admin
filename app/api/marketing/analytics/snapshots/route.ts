import { NextRequest, NextResponse } from 'next/server'
import { listSnapshots, createSnapshot } from '@/lib/marketing/analytics'
import type { SnapshotPeriod } from '@/lib/marketing/analytics'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const period    = searchParams.get('period')  ?? undefined
    const startDate = searchParams.get('start')   ?? undefined
    const endDate   = searchParams.get('end')     ?? undefined
    const limit     = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const data = await listSnapshots({
      period:    period as SnapshotPeriod | undefined,
      startDate,
      endDate,
      limit,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, period, metrics, by_source, by_device, by_page } = body

    if (!date || !period) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : date, period' },
        { status: 400 },
      )
    }

    const snapshot = await createSnapshot({
      date,
      period,
      metrics:   metrics   ?? {},
      by_source: by_source ?? {},
      by_device: by_device ?? {},
      by_page:   by_page   ?? [],
    })

    return NextResponse.json(snapshot, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
