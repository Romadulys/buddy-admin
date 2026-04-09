import { NextRequest, NextResponse } from 'next/server'
import { listProposals, createProposal } from '@/lib/marketing/proposals'
import type { ProposalStatus } from '@/lib/marketing/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const statusParam  = searchParams.get('status')
    const bloc         = searchParams.get('bloc') ?? undefined
    const priority     = searchParams.get('priority') ?? undefined
    const source       = searchParams.get('source') ?? undefined
    const agent_type   = searchParams.get('agent_type') ?? undefined
    const limit        = searchParams.get('limit')  ? Number(searchParams.get('limit'))  : undefined
    const offset       = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    // status supports comma-separated values — use the first one for now
    // (listProposals accepts a single status; multiple would require an IN filter)
    const status = statusParam ? (statusParam.split(',')[0] as ProposalStatus) : undefined

    const data = await listProposals({ status, bloc: bloc as any, priority: priority as any, source: source as any, agent_type, limit, offset })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, bloc, source, agent_type, title, summary, content, metadata, priority, status } = body

    // Required field validation
    if (!type || !bloc || !source || !title) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : type, bloc, source, title' },
        { status: 400 },
      )
    }

    // Default status based on source
    const resolvedStatus: ProposalStatus =
      status ?? (source === 'agent' ? 'pending_review' : 'draft')

    const proposal = await createProposal({
      type,
      bloc,
      source,
      agent_type:           agent_type ?? null,
      title,
      summary:              summary ?? null,
      content:              content ?? {},
      metadata:             metadata ?? {},
      priority:             priority ?? 'medium',
      status:               resolvedStatus,
      brand_review_status:  'pending',
      brand_review_details: [],
      reviewed_by:          null,
      rejection_reason:     null,
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
