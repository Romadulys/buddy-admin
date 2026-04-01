'use client'

const MOCK_SOS = [
  { id: 'SOS-001', date: '2026-03-31T11:30:00' },
  { id: 'SOS-002', date: '2026-03-30T16:45:00' },
  { id: 'SOS-003', date: '2026-03-29T09:12:00' },
]

export default function SOSAlerts() {
  const total   = MOCK_SOS.length
  const thisMth = MOCK_SOS.filter(s => s.date.startsWith('2026-03')).length

  return (
    <div className="space-y-4">
      {/* Disclaimer légal */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div>
          <p className="font-bold text-amber-800 text-sm">Buddy n&apos;est pas un service de secours</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Les alertes SOS sont transmises <strong>directement aux parents</strong> via l&apos;app Buddy.
            Buddy n&apos;est pas responsable de la gestion des urgences — cette responsabilité revient
            exclusivement aux familles et aux services d&apos;urgence (<strong>112</strong>).
          </p>
        </div>
      </div>

      {/* Stats uniquement */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-4xl font-bold text-gray-700">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total déclenchés</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-4xl font-bold text-orange-500">{thisMth}</p>
          <p className="text-xs text-gray-500 mt-1">Ce mois-ci</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Les alertes sont gérées directement entre les familles et les secours (112).<br />
        Cette section affiche uniquement des statistiques d&apos;utilisation internes.
      </p>
    </div>
  )
}
