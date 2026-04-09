import { NextRequest, NextResponse } from 'next/server'
import { listBudgetSnapshots, getBudgetLimits } from '@/lib/marketing/sea'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type  = searchParams.get('type')
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    if (type === 'limits') {
      const data = await getBudgetLimits()
      return NextResponse.json(data)
    }

    // Default: snapshots
    const data = await listBudgetSnapshots(limit)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
