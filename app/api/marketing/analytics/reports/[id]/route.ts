import { NextRequest, NextResponse } from 'next/server'
import { getReport } from '@/lib/marketing/analytics'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const report = await getReport(id)
    return NextResponse.json(report)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Rapport introuvable' }, { status: 404 })
  }
}
