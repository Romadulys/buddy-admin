'use client'

import { AgentConfig } from '@/lib/marketing/types'

interface AgentCardProps {
  agent: AgentConfig
  onToggle: (type: string, enabled: boolean) => void
  onConfig: (agent: AgentConfig) => void
  onLogs: (type: string) => void
  onRun: (type: string) => void
  running?: boolean
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function successRate(agent: AgentConfig) {
  if (agent.run_count === 0) return '—'
  return `${Math.round((agent.success_count / agent.run_count) * 100)}%`
}

export default function AgentCard({ agent, onToggle, onConfig, onLogs, onRun, running }: AgentCardProps) {
  const isEnabled = agent.enabled

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
        isEnabled
          ? 'bg-white border-indigo-200 shadow-sm'
          : 'bg-slate-50 border-slate-200 opacity-70'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-900">🤖 {agent.display_name}</p>
          {agent.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{agent.description}</p>
          )}
        </div>
        {/* Toggle switch */}
        <button
          onClick={() => onToggle(agent.agent_type, !isEnabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
          }`}
          role="switch"
          aria-checked={isEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{agent.run_count}</p>
          <p className="text-xs text-slate-500 mt-0.5">Exécutions</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{successRate(agent)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Succès %</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-500">{agent.error_count}</p>
          <p className="text-xs text-slate-500 mt-0.5">Erreurs</p>
        </div>
      </div>

      {/* Schedule info */}
      <div className="text-xs text-slate-500 space-y-1">
        <div>
          <span className="font-medium text-slate-700">Cron : </span>
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{agent.cron_schedule}</code>
        </div>
        <div>
          <span className="font-medium text-slate-700">Dernier run : </span>
          {formatDate(agent.last_run_at)}
        </div>
      </div>

      {/* Last error */}
      {agent.last_error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 break-words">
          ⚠️ {agent.last_error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onRun(agent.agent_type)}
          disabled={!isEnabled || running}
          className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {running ? '⏳ Lancement...' : '▶️ Lancer'}
        </button>
        <button
          onClick={() => onConfig(agent)}
          className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          title="Configuration"
        >
          ⚙️
        </button>
        <button
          onClick={() => onLogs(agent.agent_type)}
          className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          title="Logs"
        >
          📋
        </button>
      </div>
    </div>
  )
}
