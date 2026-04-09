import { NextRequest, NextResponse } from 'next/server'
import { getComment, updateComment } from '@/lib/marketing/social'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const comment = await getComment(id)
    return NextResponse.json(comment)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const updates = await req.json()
    const comment = await updateComment(id, updates)
    return NextResponse.json(comment)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
