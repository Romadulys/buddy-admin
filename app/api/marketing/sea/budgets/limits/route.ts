import { NextRequest, NextResponse } from 'next/server'
import { getBudgetLimits, updateBudgetLimit, type BudgetScope } from '@/lib/marketing/sea'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') as BudgetScope | null

    const data = await getBudgetLimits(scope ?? undefined)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { scope, ...updates } = body

    if (!scope) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : scope' },
        { status: 400 },
      )
    }

    const updated = await updateBudgetLimit(scope as BudgetScope, updates)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
