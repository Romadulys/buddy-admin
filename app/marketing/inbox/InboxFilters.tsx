'use client'

import {
  STATUS_LABELS,
  BLOC_LABELS,
  PRIORITY_LABELS,
  ProposalStatus,
  Bloc,
  Priority,
} from '@/lib/marketing/types'

interface InboxFiltersProps {
  status: string
  bloc: string
  priority: string
  source: string
  onChange: (key: string, value: string) => void
}

const selectClass =
  'px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none'

export default function InboxFilters({ status, bloc, priority, source, onChange }: InboxFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={status}
        onChange={(e) => onChange('status', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les statuts</option>
        {(Object.entries(STATUS_LABELS) as [ProposalStatus, string][]).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={bloc}
        onChange={(e) => onChange('bloc', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les blocs</option>
        {(Object.entries(BLOC_LABELS) as [Bloc, string][]).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(e) => onChange('priority', e.target.value)}
        className={selectClass}
      >
        <option value="">Toutes les priorités</option>
        {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={source}
        onChange={(e) => onChange('source', e.target.value)}
        className={selectClass}
      >
        <option value="">Toutes les sources</option>
        <option value="agent">Agent 🤖</option>
        <option value="human">Humain 👤</option>
      </select>
    </div>
  )
}
