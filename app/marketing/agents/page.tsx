'use client'

import { useState, useEffect, useCallback } from 'react'
import { AgentConfig, AgentLog } from '@/lib/marketing/types'
import AgentCard from './AgentCard'
import AgentConfigModal from './AgentConfigModal'
import AgentLogs from './AgentLogs'

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [configAgent, setConfigAgent] = useState<AgentConfig | null>(null)
  const [logsAgent, setLogsAgent] = useState<string | null>(null)
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [runningAgent, setRunningAgent] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/agents')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setAgents(data.agents ?? data ?? [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleToggle = async (type: string, enabled: boolean) => {
    try {
      await fetch(`/api/marketing/agents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_type: type, enabled }),
      })
      await fetchAgents()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const handleConfigSave = async (type: string, cron_schedule: string, temperature: number) => {
    try {
      await fetch(`/api/marketing/agents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_type: type, cron_schedule, temperature }),
      })
      setConfigAgent(null)
      await fetchAgents()
    } catch (err) {
      console.error('Config save error:', err)
    }
  }

  const handleOpenLogs = async (type: string) => {
    setLogsAgent(type)
    try {
      const res = await fetch(`/api/marketing/agents/${type}/logs`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs ?? data ?? [])
      } else {
        setLogs([])
      }
    } catch {
      setLogs([])
    }
  }

  const handleRun = async (type: string) => {
    setRunningAgent(type)
    try {
      await fetch(`/api/marketing/agents/${type}/run`, { method: 'POST' })
      await fetchAgents()
    } catch (err) {
      console.error('Run error:', err)
    } finally {
      setRunningAgent(null)
    }
  }

  const enabledCount = agents.filter((a) => a.enabled).length

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🤖 Agents Marketing</h1>
        {!loading && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            {enabledCount} actif{enabledCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
          <span className="text-4xl">🤖</span>
          <p className="text-sm">Aucun agent configuré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggle={handleToggle}
              onConfig={setConfigAgent}
              onLogs={handleOpenLogs}
              onRun={handleRun}
              running={runningAgent === agent.agent_type}
            />
          ))}
        </div>
      )}

      {/* Config modal */}
      {configAgent && (
        <AgentConfigModal
          agent={configAgent}
          onClose={() => setConfigAgent(null)}
          onSave={handleConfigSave}
        />
      )}

      {/* Logs modal */}
      {logsAgent && (
        <AgentLogs
          agentType={logsAgent}
          logs={logs}
          onClose={() => { setLogsAgent(null); setLogs([]) }}
        />
      )}
    </div>
  )
}
