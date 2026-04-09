'use client'

interface VocabularyEntry {
  use: string
  instead_of: string
  reason: string
}

interface VocabularyProps {
  vocabulary: {
    prefer: VocabularyEntry[]
    always_mention: string[]
    never_use: string[]
  }
}

export default function VocabularyTable({ vocabulary }: VocabularyProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-4 font-semibold text-slate-700">Utiliser ✅</th>
              <th className="text-left py-2 pr-4 font-semibold text-slate-700">Au lieu de ❌</th>
              <th className="text-left py-2 font-semibold text-slate-700">Raison</th>
            </tr>
          </thead>
          <tbody>
            {vocabulary.prefer.map((entry, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 pr-4 text-green-700 font-medium">{entry.use}</td>
                <td className="py-2 pr-4 text-red-600 line-through">{entry.instead_of}</td>
                <td className="py-2 text-slate-600">{entry.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Toujours mentionner</p>
          <div className="flex flex-wrap gap-2">
            {vocabulary.always_mention.map((term, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Ne jamais utiliser</p>
          <div className="flex flex-wrap gap-2">
            {vocabulary.never_use.map((term, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
