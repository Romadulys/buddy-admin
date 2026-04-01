import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export const revalidate = 60

type Coque = {
  id: string
  slug: string
  name: string
  label: string
  emoji: string
  img: string
  hex_color: string
  price: number
  active: boolean
  popular: boolean
  is_new: boolean
  display_order: number
  tags: string[]
}

async function getCoques(): Promise<Coque[]> {
  const { data, error } = await supabase
    .from('coques')
    .select('id, slug, name, label, emoji, img, hex_color, price, active, popular, is_new, display_order, tags')
    .order('display_order')

  if (error || !data) return []
  return data as Coque[]
}

export default async function CoquesPage() {
  const coques = await getCoques()
  const active = coques.filter((c) => c.active).length
  const popular = coques.filter((c) => c.popular).length

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue coques</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coques.length} coques · {active} actives · {popular} coups de cœur</p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>🗄️</span>
          Gérer dans Supabase
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{coques.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Actives</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Coups de cœur</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{popular}</p>
        </div>
      </div>

      {/* Grid */}
      {coques.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🎨</p>
          <p className="font-semibold text-gray-600">Catalogue vide</p>
          <p className="text-sm mt-1">Exécutez le fichier connect-all.sql dans Supabase pour seeder le catalogue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {coques.map((coque) => (
            <div
              key={coque.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                coque.active ? 'border-gray-100' : 'border-red-100 opacity-50'
              }`}
            >
              <div
                className="aspect-square relative overflow-hidden"
                style={{ background: `${coque.hex_color}15` }}
              >
                <Image
                  src={coque.img}
                  alt={coque.name}
                  fill
                  sizes="200px"
                  className="object-contain p-3"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {coque.popular && (
                    <span className="text-[9px] font-bold bg-white/90 text-amber-600 px-1.5 py-0.5 rounded-full">⭐</span>
                  )}
                  {coque.is_new && (
                    <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                  {!coque.active && (
                    <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">OFF</span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="font-bold text-gray-900 text-xs leading-tight">{coque.emoji} {coque.name}</p>
                <p className="text-[10px] text-gray-400">{coque.label}</p>
                <p className="text-xs font-black text-indigo-600 mt-1">{coque.price.toFixed(2)}€</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Pour modifier le prix ou l&apos;état des coques, utilisez{' '}
        <a
          href="https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Supabase
        </a>.
      </p>
    </div>
  )
}
