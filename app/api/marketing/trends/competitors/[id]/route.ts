import { NextRequest, NextResponse } from 'next/server'
import { updateCompetitor, deleteCompetitor } from '@/lib/marketing/trends'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()
    const updated = await updateCompetitor(params.id, body)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deleteCompetitor(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
