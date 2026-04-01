import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const TABLES = ['faq_items', 'orders', 'reviews', 'coques']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')

  const tablesToCheck = table ? [table] : TABLES

  const results: Record<string, boolean> = {}

  for (const t of tablesToCheck) {
    const { error } = await supabase.from(t).select('count').limit(1)
    results[t] = !error
  }

  if (table) {
    return NextResponse.json({ exists: results[table] ?? false })
  }

  return NextResponse.json(results)
}
