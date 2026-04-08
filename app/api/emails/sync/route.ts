import { syncGmail } from '@/lib/gmail'

export async function POST() {
  try {
    const result = await syncGmail()
    return Response.json({
      success: true,
      newEmails: result.newEmails.length,
      totalFetched: result.totalFetched,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
