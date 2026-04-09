import { NextRequest, NextResponse } from 'next/server'
import { listAgentConfigs, updateAgentConfig } from '@/lib/marketing/agents'

export async function GET() {
  try {
    const data = await listAgentConfigs()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_type, ...updates } = body

    if (!agent_type) {
      return NextResponse.json(
        { error: 'Champ obligatoire manquant : agent_type' },
        { status: 400 },
      )
    }

    const updated = await updateAgentConfig(agent_type, updates)
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
