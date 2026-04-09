import { NextResponse } from 'next/server'
import { getLatestAudit } from '@/lib/marketing/seo'

export async function GET() {
  try {
    const data = await getLatestAudit()

    if (!data) {
      return NextResponse.json({ error: 'Aucun audit trouvé' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
