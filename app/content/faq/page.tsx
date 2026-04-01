import { supabase } from '@/lib/supabase'
import FAQClient, { type FAQItem } from './FAQClient'

export const dynamic = 'force-dynamic'

async function getFaqs(): Promise<FAQItem[]> {
  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .order('category')
    .order('display_order')

  if (error || !data) return []
  return data as FAQItem[]
}

export default async function FAQPage() {
  const initialFaqs = await getFaqs()
  return <FAQClient initialFaqs={initialFaqs} />
}
