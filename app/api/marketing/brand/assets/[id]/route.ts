import { NextRequest, NextResponse } from 'next/server'
import { deleteAsset } from '@/lib/marketing/brand'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Parametre id manquant' }, { status: 400 })
    }

    await deleteAsset(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
