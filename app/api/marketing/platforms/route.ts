import { NextResponse } from 'next/server'
import { listPlatforms } from '@/lib/marketing/platforms'

export async function GET() {
  try {
    const data = await listPlatforms()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
