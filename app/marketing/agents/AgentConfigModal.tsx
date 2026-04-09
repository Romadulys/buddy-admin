'use client'

import { useState, useEffect, useRef } from 'react'
import { AgentConfig } from '@/lib/marketing/types'

interface AgentConfigModalProps {
  agent: AgentConfig
  onClose: () => void
  onSave: (type: string, cron_schedule: string, temperature: number) => void
}

export default function AgentConfigModal({ agent, onClose, onSave }: AgentConfigModalProps) {
  const [cron, setCron] = useState(agent.cron_schedule)
  const [temperature, setTemperature] = useState(agent.temperature)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCron(agent.cron_schedule)
    setTemperature(agent.temperature)
  }, [agent])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <h2 className="text-lg font-bold text-slate-900">
          ⚙️ Configuration — {agent.display_name}
        </h2>

        {/* Cron schedule */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Planning Cron
          </label>
          <input
            type="text"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            placeholder="0 8 * * *"
          />
          <p className="text-xs text-slate-400 mt-1">
            Format : <code>minute heure jour_du_mois mois jour_de_semaine</code>
          </p>
        </div>

        {/* Temperature slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">Température</label>
            <span className="text-sm font-bold text-indigo-600">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>Précis (0)</span>
            <span>Créatif (1.5)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(agent.agent_type, cron, temperature)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
