import { supabase } from '@/lib/supabase'
import type { AgentConfig, AgentLog, AgentLogStatus } from './types'

// ------------------------------------------------------------
// listAgentConfigs
// ------------------------------------------------------------

export async function listAgentConfigs(): Promise<AgentConfig[]> {
  const { data, error } = await supabase
    .from('agent_configs')
    .select('*')
    .order('display_name', { ascending: true })

  if (error) throw error
  return data as AgentConfig[]
}

// ------------------------------------------------------------
// getAgentConfig
// ------------------------------------------------------------

export async function getAgentConfig(agentType: string): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from('agent_configs')
    .select('*')
    .eq('agent_type', agentType)
    .single()

  if (error) throw error
  return data as AgentConfig
}

// ------------------------------------------------------------
// updateAgentConfig
// ------------------------------------------------------------

export type AgentConfigUpdates = Partial<
  Pick<
    AgentConfig,
    | 'enabled'
    | 'cron_schedule'
    | 'temperature'
    | 'display_name'
    | 'description'
    | 'config'
    | 'next_run_at'
  >
>

export async function updateAgentConfig(
  agentType: string,
  updates: AgentConfigUpdates,
): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from('agent_configs')
    .update(updates)
    .eq('agent_type', agentType)
    .select()
    .single()

  if (error) throw error
  return data as AgentConfig
}

// ------------------------------------------------------------
// logAgentRun
// ------------------------------------------------------------

export interface AgentRunDetails {
  proposals_created?: number
  memories_created?: number
  error_message?: string
  details?: Record<string, unknown>
  finished_at?: string
  duration_ms?: number
}

export async function logAgentRun(
  agentType: string,
  status: AgentLogStatus,
  runDetails?: AgentRunDetails,
): Promise<AgentLog> {
  const now = new Date().toISOString()

  const payload = {
    agent_type:        agentType,
    status,
    started_at:        now,
    finished_at:       runDetails?.finished_at ?? (status !== 'running' ? now : null),
    duration_ms:       runDetails?.duration_ms ?? null,
    proposals_created: runDetails?.proposals_created ?? 0,
    memories_created:  runDetails?.memories_created ?? 0,
    error_message:     runDetails?.error_message ?? null,
    details:           runDetails?.details ?? {},
  }

  const { data, error } = await supabase
    .from('agent_logs')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  // Update agent_configs counters
  const configUpdates: Record<string, unknown> = { last_run_at: now }
  if (status === 'success') {
    const config = await supabase
      .from('agent_configs')
      .select('run_count, success_count')
      .eq('agent_type', agentType)
      .single()

    if (!config.error && config.data) {
      configUpdates.run_count     = (config.data.run_count ?? 0) + 1
      configUpdates.success_count = (config.data.success_count ?? 0) + 1
    }
  } else if (status === 'error') {
    const config = await supabase
      .from('agent_configs')
      .select('run_count, error_count')
      .eq('agent_type', agentType)
      .single()

    if (!config.error && config.data) {
      configUpdates.run_count   = (config.data.run_count ?? 0) + 1
      configUpdates.error_count = (config.data.error_count ?? 0) + 1
      configUpdates.last_error  = runDetails?.error_message ?? null
    }
  }

  await supabase
    .from('agent_configs')
    .update(configUpdates)
    .eq('agent_type', agentType)

  return data as AgentLog
}

// ------------------------------------------------------------
// listAgentLogs
// ------------------------------------------------------------

export async function listAgentLogs(agentType?: string, limit = 50): Promise<AgentLog[]> {
  let query = supabase
    .from('agent_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (agentType) query = query.eq('agent_type', agentType)

  const { data, error } = await query

  if (error) throw error
  return data as AgentLog[]
}
