import { Email } from './email-mock'

export interface AIAnalysis {
  sentiment: string
  urgence: string
  categorie: string
  resume: string
  mots_cles: string[]
  priorite: number
  routage: string
  reponse_suggeree: string
}

export async function analyzeEmail(email: Email): Promise<AIAnalysis> {
  const mode = process.env.AI_MODE || 'mock'
  if (mode === 'live') {
    throw new Error('AI_MODE=live not yet implemented. Set AI_MODE=mock.')
  }
  // Mock mode: return pre-filled ai_* fields from email
  // Phase 2: Integrate Claude API for real email analysis
  return {
    sentiment: email.ai_sentiment,
    urgence: email.ai_urgence,
    categorie: email.ai_categorie,
    resume: email.ai_resume,
    mots_cles: email.ai_mots_cles,
    priorite: email.ai_priorite,
    routage: email.ai_routage,
    reponse_suggeree: email.ai_reponse_suggeree,
  }
}
