import { Email, mockEmails } from './email-mock'

export interface SyncResult {
  newEmails: Email[]
  totalFetched: number
}

export async function syncGmail(): Promise<SyncResult> {
  const mode = process.env.AI_MODE || 'mock'
  if (mode === 'live') {
    throw new Error('AI_MODE=live not yet implemented. Set AI_MODE=mock.')
  }
  // Mock mode: return all mockEmails
  return {
    newEmails: mockEmails,
    totalFetched: mockEmails.length,
  }
}
