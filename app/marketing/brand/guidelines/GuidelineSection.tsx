'use client'

import { useState } from 'react'

interface GuidelineSectionProps {
  section: string
  title: string
  icon: string
  content: Record<string, unknown>
  onSave: (section: string, content: Record<string, unknown>) => void
  children?: React.ReactNode
}

export default function GuidelineSection({
  section,
  title,
  icon,
  content,
  onSave,
  children,
}: GuidelineSectionProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(JSON.stringify(content, null, 2))
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft)
      onSave(section, parsed)
      setEditing(false)
      setError(null)
    } catch {
      setError('JSON invalide')
    }
  }

  const handleCancel = () => {
    setDraft(JSON.stringify(content, null, 2))
    setEditing(false)
    setError(null)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
        {!editing && (
          <button
            onClick={() => {
              setDraft(JSON.stringify(content, null, 2))
              setEditing(true)
            }}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            ✏️ Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full h-64 font-mono text-sm p-3 border border-slate-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors"
            >
              💾 Enregistrer
            </button>
          </div>
        </div>
      ) : children ? (
        children
      ) : (
        <pre className="text-xs text-slate-500 bg-slate-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      )}
    </div>
  )
}
