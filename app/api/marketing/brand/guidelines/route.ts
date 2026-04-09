import { NextRequest, NextResponse } from 'next/server'
import { listGuidelines, updateGuideline } from '@/lib/marketing/brand'
import type { GuidelineSection } from '@/lib/marketing/brand'

export async function GET() {
  try {
    const data = await listGuidelines()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, content } = body

    if (!section || !content) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : section, content' },
        { status: 400 },
      )
    }

    const data = await updateGuideline(section as GuidelineSection, content)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
