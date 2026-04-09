import { NextRequest, NextResponse } from 'next/server'
import { getSocialPost, updateSocialPost, deleteSocialPost } from '@/lib/marketing/social'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const post = await getSocialPost(params.id)
    return NextResponse.json(post)
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
    const post = await updateSocialPost(params.id, updates)
    return NextResponse.json(post)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deleteSocialPost(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
