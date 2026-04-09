import { NextRequest, NextResponse } from 'next/server'
import { listAssets, createAsset } from '@/lib/marketing/brand'
import type { AssetCategory } from '@/lib/marketing/brand'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined

    const data = await listAssets(category as AssetCategory | undefined)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, name, file_url, file_type, file_size, dimensions, tags, usage_notes } = body

    if (!category || !name || !file_url || !file_type) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : category, name, file_url, file_type' },
        { status: 400 },
      )
    }

    const data = await createAsset({
      category,
      name,
      file_url,
      file_type,
      file_size:   file_size   ?? null,
      dimensions:  dimensions  ?? null,
      tags:        tags        ?? [],
      usage_notes: usage_notes ?? null,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
