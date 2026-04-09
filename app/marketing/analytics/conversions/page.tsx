'use client'

const FUNNEL_STEPS = [
  { label: 'Visite', count: '24 500', pct: 100, dropOff: null },
  { label: 'Page produit', count: '11 025', pct: 45, dropOff: '-55%' },
  { label: 'Ajout panier', count: '2 940', pct: 12, dropOff: '-73%' },
  { label: 'Checkout', count: '1 960', pct: 8, dropOff: '-33%' },
  { label: 'Achat', count: '1 274', pct: 5.2, dropOff: '-35%' },
]

const GOAL_CARDS = [
  { label: 'Achat', icon: '🛒', value: '--', color: 'bg-green-50 border-green-200 text-green-700' },
  { label: 'Inscription newsletter', icon: '📧', value: '--', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { label: 'Telechargement app', icon: '📲', value: '--', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { label: 'Contact', icon: '💬', value: '--', color: 'bg-orange-50 border-orange-200 text-orange-700' },
]

// Funnel bar goes from indigo-600 (100%) down to indigo-200 (lightest)
const BAR_COLORS = [
  'bg-indigo-600',
  'bg-indigo-500',
  'bg-indigo-400',
  'bg-indigo-300',
  'bg-indigo-200',
]

export default function ConversionsPage() {
  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900 mb-6">🎯 Conversions & Funnel</h1>

      {/* Funnel visualization */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Funnel de conversion</h2>
        <div className="space-y-1">
          {FUNNEL_STEPS.map((step, i) => (
            <div key={step.label}>
              {step.dropOff && (
                <div className="flex items-center gap-2 py-1 pl-40">
                  <span className="text-xs font-semibold text-red-500">↓ {step.dropOff}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                {/* Label */}
                <span className="w-36 shrink-0 text-sm font-medium text-slate-600 text-right pr-4">
                  {step.label}
                </span>
                {/* Bar */}
                <div className="flex-1 h-8 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${BAR_COLORS[i]}`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                {/* Count + pct */}
                <div className="w-32 shrink-0 flex items-center justify-end gap-2">
                  <span className="text-sm text-slate-500">{step.count}</span>
                  <span className="text-sm font-semibold text-slate-700">{step.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion goals */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Objectifs de conversion</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOAL_CARDS.map((goal) => (
            <div
              key={goal.label}
              className={`rounded-lg border p-4 ${goal.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{goal.icon}</span>
                <span className="text-sm font-medium">{goal.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-400">{goal.value}</p>
              <p className="text-xs text-slate-400 mt-1">conversions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentation placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Segmentation</h2>
        <div className="flex items-center gap-3 px-4 py-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-500">
          <span className="text-2xl">🔒</span>
          <span>Segmentation par source et device disponible apres connexion GA4 —{' '}
            <a href="/marketing/platforms" className="text-indigo-600 underline font-medium">
              Connecter Google Analytics
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
