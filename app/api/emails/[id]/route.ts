import { getEmailById } from '@/lib/email-mock'

interface Params {
  id: string
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params
  const email = getEmailById(id)

  if (!email) {
    return Response.json({ error: 'Email not found' }, { status: 404 })
  }

  return Response.json(email)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params
  const email = getEmailById(id)

  if (!email) {
    return Response.json({ error: 'Email not found' }, { status: 404 })
  }

  const updates = await request.json()
  // In a real implementation, would update database
  // For now, just return success
  return Response.json({
    success: true,
    id,
    updated: updates,
  })
}
