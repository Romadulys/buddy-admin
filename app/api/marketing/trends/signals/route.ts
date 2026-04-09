import { NextRequest, NextResponse } from 'next/server'
import { listSignals, createSignal } from '@/lib/marketing/trends'
import type { SignalType, BuddyImpact } from '@/lib/marketing/trends'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type        = searchParams.get('type')   as SignalType | null
    const buddy_impact = searchParams.get('impact') as BuddyImpact | null
    const limit       = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const data = await listSignals({
      type:         type        ?? undefined,
      buddy_impact: buddy_impact ?? undefined,
      limit:        limit        ?? undefined,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, source, title, detail, relevance_score, buddy_impact, cascaded_to, expires_at } = body

    if (!type || !source || !title) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : type, source, title' },
        { status: 400 },
      )
    }

    const signal = await createSignal({
      type,
      source,
      title,
      detail:          detail           ?? {},
      relevance_score: relevance_score  ?? 0,
      buddy_impact:    buddy_impact      ?? 'low',
      cascaded_to:     cascaded_to       ?? [],
      expires_at:      expires_at        ?? null,
    })

    return NextResponse.json(signal, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
