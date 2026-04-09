import { NextRequest, NextResponse } from 'next/server'
import { listCompetitors, createCompetitor } from '@/lib/marketing/trends'

export async function GET() {
  try {
    const data = await listCompetitors()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, domain, enabled, watch_config, last_crawled_at } = body

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : name, domain' },
        { status: 400 },
      )
    }

    const competitor = await createCompetitor({
      name,
      domain,
      enabled:        enabled        ?? true,
      watch_config:   watch_config   ?? {},
      last_crawled_at: last_crawled_at ?? null,
    })

    return NextResponse.json(competitor, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
