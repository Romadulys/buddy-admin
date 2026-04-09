'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Competitor, CompetitorEvent, CompetitorEventType } from '@/lib/marketing/trends'
import { EVENT_TYPE_ICONS } from '@/lib/marketing/trends'

function EventItem({ event }: { event: CompetitorEvent }) {
  const icon = EVENT_TYPE_ICONS[event.type as CompetitorEventType] ?? '📌'
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{event.title}</p>
        {event.agent_analysis && (
          <p className="text-xs text-slate-500 mt-1">{event.agent_analysis}</p>
        )}
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
        {new Date(event.detected_at).toLocaleDateString('fr-FR')}
      </span>
    </div>
  )
}

interface CompetitorCardProps {
  competitor: Competitor
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
}

function CompetitorCard({ competitor, onToggle, onDelete }: CompetitorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [events, setEvents] = useState<CompetitorEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  const loadEvents = useCallback(async () => {
    if (!expanded) return
    setEventsLoading(true)
    try {
      const res = await fetch(`/api/marketing/trends/competitors/${competitor.id}/events`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEvents(data ?? [])
    } catch {
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }, [expanded, competitor.id])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${competitor.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
      {/* Card header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-lg uppercase">{competitor.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{competitor.name}</p>
          <p className="text-xs text-slate-400">{competitor.domain}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {competitor.last_crawled_at && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Crawle le {new Date(competitor.last_crawled_at).toLocaleDateString('fr-FR')}
            </span>
          )}
          {/* Enabled toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(competitor.id, !competitor.enabled) }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${competitor.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${competitor.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`}
            />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(competitor.id) }}
            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Suppr.
          </button>
          <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded events */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-500 mt-3 mb-2">Evenements recents</p>
          {eventsLoading ? (
            <p className="text-sm text-slate-400 py-4 text-center">Chargement...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Aucun evenement detecte pour ce concurrent.</p>
          ) : (
            <div>
              {events.map((ev) => (
                <EventItem key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCompetitors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/trends/competitors')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCompetitors(data ?? [])
    } catch {
      setCompetitors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompetitors()
  }, [fetchCompetitors])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newDomain.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/marketing/trends/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), domain: newDomain.trim() }),
      })
      setNewName('')
      setNewDomain('')
      setShowForm(false)
      await fetchCompetitors()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/marketing/trends/competitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      setCompetitors((prev) => prev.map((c) => c.id === id ? { ...c, enabled } : c))
    } catch {
      // silent
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce concurrent et tous ses evenements ?')) return
    try {
      await fetch(`/api/marketing/trends/competitors/${id}`, { method: 'DELETE' })
      setCompetitors((prev) => prev.filter((c) => c.id !== id))
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏢 Veille Concurrentielle</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi des activites de vos concurrents</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Ajouter un concurrent
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-indigo-200 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nom du concurrent</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ex: Kidly"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Domaine</label>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="ex: kidly.co.uk"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Ajout...' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
        </form>
      )}

      {/* Competitors list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : competitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          Aucun concurrent suivi. Ajoutez votre premier concurrent.
        </div>
      ) : (
        <div className="space-y-3">
          {competitors.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
