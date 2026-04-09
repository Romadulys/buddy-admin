import { NextRequest, NextResponse } from 'next/server'
import { listSeasonalCalendar, getUpcomingSeasons, updateSeasonalEntry } from '@/lib/marketing/trends'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const months   = searchParams.get('months') ? Number(searchParams.get('months')) : 3

    if (upcoming) {
      const data = await getUpcomingSeasons(months)
      return NextResponse.json(data)
    }

    const data = await listSeasonalCalendar()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id obligatoire' }, { status: 400 })
    }
    const updated = await updateSeasonalEntry(id, updates)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
