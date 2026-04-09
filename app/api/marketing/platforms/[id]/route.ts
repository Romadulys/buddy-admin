import { NextRequest, NextResponse } from 'next/server'
import { togglePlatform, connectPlatform, disconnectPlatform } from '@/lib/marketing/platforms'
import type { Platform } from '@/lib/marketing/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const platform = id as Platform
    const body = await req.json()
    const { action, ...rest } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : action' },
        { status: 400 },
      )
    }

    let result

    switch (action) {
      case 'toggle':
        result = await togglePlatform(platform, rest.enabled)
        break
      case 'connect':
        result = await connectPlatform(platform, rest)
        break
      case 'disconnect':
        result = await disconnectPlatform(platform)
        break
      default:
        return NextResponse.json(
          { error: `Action inconnue : "${action}". Actions valides : toggle, connect, disconnect` },
          { status: 400 },
        )
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
