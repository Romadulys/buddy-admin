import { NextRequest, NextResponse } from 'next/server'
import { getProposal, updateProposalStatus } from '@/lib/marketing/proposals'
import { supabase } from '@/lib/supabase'
import type { ProposalStatus } from '@/lib/marketing/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const proposal = await getProposal(id)
    return NextResponse.json(proposal)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Proposition introuvable' }, { status: 404 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()

    if ('status' in body) {
      const { status, rejection_reason, reviewed_by } = body
      const updated = await updateProposalStatus(id, status as ProposalStatus, {
        rejection_reason,
        reviewed_by,
      })
      return NextResponse.json(updated)
    }

    // Generic update for other fields
    const { data, error } = await supabase
      .from('proposals')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
