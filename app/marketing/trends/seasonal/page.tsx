'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SeasonalEntry, SeasonalRelevance } from '@/lib/marketing/trends'
import { SEASONAL_RELEVANCE_BADGES, SEASONAL_RELEVANCE_COLORS } from '@/lib/marketing/trends'

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

function daysUntilMonth(month: number): number {
  const now = new Date()
  const target = new Date(now.getFullYear(), month - 1, 1)
  if (target < now) target.setFullYear(now.getFullYear() + 1)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function isInPrepWindow(month: number, prepWeeks: number): boolean {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const daysThisMonth = new Date(now.getFullYear(), currentMonth, 0).getDate()
  const remainingDays = daysThisMonth - currentDay
  const totalDaysLeft = remainingDays + (month > currentMonth
    ? (month - currentMonth - 1) * 30
    : 0)
  // Same month edge case
  if (month === currentMonth) return true
  return totalDaysLeft <= prepWeeks * 7
}

interface MonthCardProps {
  month: number
  entries: SeasonalEntry[]
  isCurrent: boolean
  onEditRequest: (entry: SeasonalEntry) => void
}

function MonthCard({ month, entries, isCurrent, onEditRequest }: MonthCardProps) {
  return (
    <div
      className={`rounded-xl border shadow-sm overflow-hidden ${isCurrent ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200 bg-white'}`}
    >
      <div className={`px-4 py-3 border-b ${isCurrent ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
        <p className={`font-semibold text-sm ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
          {MONTH_NAMES[month - 1]}
          {isCurrent && <span className="ml-2 text-indigo-200 font-normal text-xs">— Mois actuel</span>}
        </p>
      </div>
      <div className="p-3 space-y-3 bg-white">
        {entries.length === 0 ? (
          <p className="text-xs text-slate-300 py-2 text-center">Aucun evenement</p>
        ) : (
          entries.map((entry) => {
            const inPrep = isInPrepWindow(entry.month, entry.prep_weeks_before)
            return (
              <div key={entry.id} className="space-y-2">
                {inPrep && !isCurrent && (
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    <span className="text-xs">⚠️</span>
                    <span className="text-xs font-medium">Preparation en cours</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{entry.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${SEASONAL_RELEVANCE_COLORS[entry.buddy_relevance]}`}>
                        {SEASONAL_RELEVANCE_BADGES[entry.buddy_relevance]} {entry.buddy_relevance === 'high' ? 'Haute' : entry.buddy_relevance === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                      <span className="text-xs text-slate-400">{entry.prep_weeks_before}s avant</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onEditRequest(entry)}
                    className="text-xs text-slate-400 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors flex-shrink-0"
                  >
                    ✏️
                  </button>
                </div>
                {/* Suggested actions */}
                {entry.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.suggested_actions.map((action) => (
                      <span key={action} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                        {action}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

interface EditModalProps {
  entry: SeasonalEntry
  onSave: (id: string, updates: Partial<SeasonalEntry>) => Promise<void>
  onClose: () => void
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState({
    event: entry.event,
    buddy_relevance: entry.buddy_relevance as SeasonalRelevance,
    prep_weeks_before: entry.prep_weeks_before,
    suggested_actions: entry.suggested_actions.join('\n'),
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(entry.id, {
        event: form.event,
        buddy_relevance: form.buddy_relevance,
        prep_weeks_before: form.prep_weeks_before,
        suggested_actions: form.suggested_actions.split('\n').map((s) => s.trim()).filter(Boolean),
      })
      onClose()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Modifier l'evenement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'evenement</label>
            <input
              type="text"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pertinence Buddy</label>
            <select
              value={form.buddy_relevance}
              onChange={(e) => setForm({ ...form, buddy_relevance: e.target.value as SeasonalRelevance })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="high">🔥 Haute</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="low">⚪ Faible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semaines de preparation</label>
            <input
              type="number"
              min={1}
              max={52}
              value={form.prep_weeks_before}
              onChange={(e) => setForm({ ...form, prep_weeks_before: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Actions suggeres (une par ligne)</label>
            <textarea
              rows={4}
              value={form.suggested_actions}
              onChange={(e) => setForm({ ...form, suggested_actions: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SeasonalPage() {
  const [calendar, setCalendar] = useState<SeasonalEntry[]>([])
  const [upcoming, setUpcoming] = useState<SeasonalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<SeasonalEntry | null>(null)

  const currentMonth = new Date().getMonth() + 1

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const [calRes, upRes] = await Promise.all([
        fetch('/api/marketing/trends/seasonal'),
        fetch('/api/marketing/trends/seasonal?upcoming=true&months=3'),
      ])
      const [calData, upData] = await Promise.all([calRes.json(), upRes.json()])
      setCalendar(calData ?? [])
      setUpcoming(upData ?? [])
    } catch {
      setCalendar([])
      setUpcoming([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const handleSave = async (id: string, updates: Partial<SeasonalEntry>) => {
    const res = await fetch(`/api/marketing/trends/seasonal`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    if (!res.ok) throw new Error('Save failed')
    await fetchCalendar()
  }

  // Group calendar entries by month
  const byMonth: Record<number, SeasonalEntry[]> = {}
  for (let m = 1; m <= 12; m++) byMonth[m] = []
  for (const entry of calendar) {
    byMonth[entry.month]?.push(entry)
  }

  // Unique months in upcoming (deduplicated by month)
  const upcomingMonths = Array.from(new Set(upcoming.map((e) => e.month)))

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📅 Calendrier Saisonnier Buddy</h1>
        <p className="text-sm text-slate-500 mt-1">Evenements cles et preparation des campagnes saisonnieres</p>
      </div>

      {/* Upcoming section */}
      {!loading && upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase text-slate-500 mb-3">Prochains evenements (3 mois)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMonths.map((month) => {
              const entries = upcoming.filter((e) => e.month === month)
              const days = daysUntilMonth(month)
              const isCurrent = month === currentMonth
              return (
                <div key={month} className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-900">{MONTH_NAMES[month - 1]}</p>
                    {!isCurrent && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5 font-medium">
                        Dans {days}j
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                        Maintenant
                      </span>
                    )}
                  </div>
                  {entries.map((entry) => (
                    <div key={entry.id} className="mb-2 last:mb-0">
                      <p className="text-sm text-slate-700 font-medium">{entry.event}</p>
                      <span className={`inline-flex items-center gap-1 text-xs mt-1 font-medium px-2 py-0.5 rounded-full ${SEASONAL_RELEVANCE_COLORS[entry.buddy_relevance]}`}>
                        {SEASONAL_RELEVANCE_BADGES[entry.buddy_relevance]} Pertinence {entry.buddy_relevance === 'high' ? 'haute' : entry.buddy_relevance === 'medium' ? 'moyenne' : 'faible'}
                      </span>
                      {isInPrepWindow(entry.month, entry.prep_weeks_before) && !isCurrent && (
                        <div className="mt-2 flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                          <span className="text-xs">⚠️</span>
                          <span className="text-xs font-medium">Preparation en cours</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 12-month grid */}
      <h2 className="text-sm font-semibold uppercase text-slate-500 mb-3">Calendrier annuel</h2>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <MonthCard
              key={month}
              month={month}
              entries={byMonth[month] ?? []}
              isCurrent={month === currentMonth}
              onEditRequest={setEditingEntry}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  )
}
