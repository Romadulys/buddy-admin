import { NextRequest, NextResponse } from 'next/server'
import { listContentByMonth } from '@/lib/marketing/content'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const now = new Date()

    const year  = searchParams.get('year')  ? Number(searchParams.get('year'))  : now.getFullYear()
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : now.getMonth() + 1

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Le parametre month doit etre compris entre 1 et 12' },
        { status: 400 },
      )
    }

    const data = await listContentByMonth(year, month)
    return NextResponse.json({ year, month, items: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
