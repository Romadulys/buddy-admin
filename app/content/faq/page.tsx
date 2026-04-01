import { supabase } from '@/lib/supabase'
import FAQClient, { type FAQItem } from './FAQClient'

// Fallback mock data if Supabase is not yet seeded
const FALLBACK_FAQS: FAQItem[] = [
  { id: '1', question: 'Quel âge pour utiliser Buddy ?', answer: "Buddy est conçu pour les enfants de 4 à 8 ans.", category: 'Produit', published: true, display_order: 1 },
]

async function getFaqs(): Promise<FAQItem[]> {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('category')
      .order('display_order')

    if (error || !data || data.length === 0) return FALLBACK_FAQS
    return data as FAQItem[]
  } catch {
    return FALLBACK_FAQS
  }
}

export default async function FAQPage() {
  const initialFaqs = await getFaqs()
  return <FAQClient initialFaqs={initialFaqs} />
}
