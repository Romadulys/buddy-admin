import { NextResponse } from 'next/server'
import { getCommentStats } from '@/lib/marketing/social'

export async function GET() {
  try {
    const stats = await getCommentStats()
    return NextResponse.json(stats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
