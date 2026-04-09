import { NextRequest, NextResponse } from 'next/server'
import { getAgentConfig, logAgentRun } from '@/lib/marketing/agents'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params

    const config = await getAgentConfig(type)

    if (!config.enabled) {
      return NextResponse.json(
        { error: `L'agent "${config.display_name}" est désactivé` },
        { status: 403 },
      )
    }

    const logEntry = await logAgentRun(type, 'running')

    return NextResponse.json(logEntry, { status: 202 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
