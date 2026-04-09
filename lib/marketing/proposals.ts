import { supabase } from '@/lib/supabase'
import type { Proposal, ProposalStatus, Bloc, Priority, ProposalSource } from './types'

// ------------------------------------------------------------
// Filters
// ------------------------------------------------------------

export interface ListProposalsFilters {
  status?: ProposalStatus
  bloc?: Bloc
  priority?: Priority
  source?: ProposalSource
  agent_type?: string
  limit?: number
  offset?: number
}

// ------------------------------------------------------------
// listProposals
// ------------------------------------------------------------

export async function listProposals(filters: ListProposalsFilters = {}): Promise<Proposal[]> {
  const {
    status,
    bloc,
    priority,
    source,
    agent_type,
    limit = 50,
    offset = 0,
  } = filters

  let query = supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)     query = query.eq('status', status)
  if (bloc)       query = query.eq('bloc', bloc)
  if (priority)   query = query.eq('priority', priority)
  if (source)     query = query.eq('source', source)
  if (agent_type) query = query.eq('agent_type', agent_type)

  const { data, error } = await query

  if (error) throw error
  return data as Proposal[]
}

// ------------------------------------------------------------
// getProposal
// ------------------------------------------------------------

export async function getProposal(id: string): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Proposal
}

// ------------------------------------------------------------
// createProposal
// ------------------------------------------------------------

export type CreateProposalInput = Omit<
  Proposal,
  'id' | 'created_at' | 'updated_at' | 'reviewed_at' | 'published_at'
>

export async function createProposal(proposal: CreateProposalInput): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .insert(proposal)
    .select()
    .single()

  if (error) throw error
  return data as Proposal
}

// ------------------------------------------------------------
// updateProposalStatus
// ------------------------------------------------------------

type StatusExtra = {
  reviewed_by?: string
  rejection_reason?: string
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
  extra?: StatusExtra,
): Promise<Proposal> {
  const now = new Date().toISOString()

  const updates: Partial<Proposal> = { status }

  if (status === 'approved' || status === 'rejected') {
    updates.reviewed_at = now
    if (extra?.reviewed_by) updates.reviewed_by = extra.reviewed_by
  }

  if (status === 'rejected' && extra?.rejection_reason) {
    updates.rejection_reason = extra.rejection_reason
  }

  if (status === 'published') {
    updates.published_at = now
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Proposal
}

// ------------------------------------------------------------
// countProposalsByStatus
// ------------------------------------------------------------

export async function countProposalsByStatus(): Promise<Record<ProposalStatus, number>> {
  const { data, error } = await supabase
    .from('proposals')
    .select('status')

  if (error) throw error

  const counts: Record<string, number> = {
    draft:            0,
    pending_review:   0,
    approved:         0,
    ready_to_publish: 0,
    published:        0,
    rejected:         0,
  }

  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }

  return counts as Record<ProposalStatus, number>
}
