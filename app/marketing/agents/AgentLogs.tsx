'use client'

import { useRef } from 'react'
import { AgentLog } from '@/lib/marketing/types'

interface AgentLogsProps {
  agentType: string
  logs: AgentLog[]
  onClose: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function logBg(status: AgentLog['status']) {
  switch (status) {
    case 'running': return 'bg-blue-50 border-blue-100'
    case 'success': return 'bg-green-50 border-green-100'
    case 'error':   return 'bg-red-50 border-red-100'
    default:        return 'bg-slate-50 border-slate-100'
  }
}

function logIcon(status: AgentLog['status']) {
  switch (status) {
    case 'running': return '⏳'
    case 'success': return '✅'
    case 'error':   return '❌'
    default:        return '•'
  }
}

export default function AgentLogs({ agentType, logs, onClose }: AgentLogsProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">📋 Logs — {agentType}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
              <span className="text-3xl">📭</span>
              <p className="text-sm">Aucun log disponible — les logs apparaîtront lors des prochaines exécutions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-lg border p-4 text-sm ${logBg(log.status)}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span>{logIcon(log.status)}</span>
                      <span className="font-medium text-slate-800">{formatDate(log.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {log.duration_ms != null && (
                        <span>{(log.duration_ms / 1000).toFixed(1)}s</span>
                      )}
                      {log.proposals_created > 0 && (
                        <span>{log.proposals_created} proposition(s)</span>
                      )}
                    </div>
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-red-600 mt-1.5 bg-red-100 rounded px-2 py-1">
                      {log.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
