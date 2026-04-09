import { NextRequest, NextResponse } from 'next/server'
import { getComment, updateComment } from '@/lib/marketing/social'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const comment = await getComment(params.id)
    return NextResponse.json(comment)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await req.json()
    const comment = await updateComment(params.id, updates)
    return NextResponse.json(comment)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
