import { NextResponse } from 'next/server'
import { getBacklinkStats } from '@/lib/marketing/seo'

export async function GET() {
  try {
    const data = await getBacklinkStats()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
