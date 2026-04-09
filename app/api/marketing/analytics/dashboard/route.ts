import { NextResponse } from 'next/server'
import { getDashboardSummary } from '@/lib/marketing/analytics'

export async function GET() {
  try {
    const summary = await getDashboardSummary()
    return NextResponse.json(summary)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
