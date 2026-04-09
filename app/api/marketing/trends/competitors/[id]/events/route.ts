import { NextRequest, NextResponse } from 'next/server'
import { listCompetitorEvents } from '@/lib/marketing/trends'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50

    const data = await listCompetitorEvents(params.id, limit)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
