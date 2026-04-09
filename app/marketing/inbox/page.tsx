'use client'

import { useState, useEffect, useCallback } from 'react'
import { Proposal, ProposalStatus } from '@/lib/marketing/types'
import InboxFilters from './InboxFilters'
import ProposalCard from './ProposalCard'
import ProposalDetail from './ProposalDetail'

interface Filters {
  status: string
  bloc: string
  priority: string
  source: string
}

export default function InboxPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    status: '',
    bloc: '',
    priority: '',
    source: '',
  })

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.bloc) params.set('bloc', filters.bloc)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.source) params.set('source', filters.source)

      const res = await fetch(`/api/marketing/proposals?${params.toString()}`)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setProposals(data.proposals ?? data ?? [])
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setSelectedId(null)
  }

  const handleStatusChange = async (
    id: string,
    status: ProposalStatus,
    extra?: Record<string, unknown>
  ) => {
    try {
      await fetch(`/api/marketing/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      await fetchProposals()
    } catch (err) {
      console.error('Failed to update proposal:', err)
    }
  }

  const pendingCount = proposals.filter((p) => p.status === 'pending_review').length
  const selectedProposal = proposals.find((p) => p.id === selectedId) ?? null

  return (
    <div className="p-6 anim-section h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">📥 Inbox Marketing</h1>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              {pendingCount} en attente
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <InboxFilters
          status={filters.status}
          bloc={filters.bloc}
          priority={filters.priority}
          source={filters.source}
          onChange={handleFilterChange}
        />
      </div>

      {/* Split layout */}
      <div className="flex flex-1 gap-0 min-h-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Left list */}
        <div className="w-96 flex-shrink-0 border-r border-slate-100 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Chargement...
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <span className="text-4xl">📭</span>
              <p className="text-sm">Aucune proposition</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                selected={proposal.id === selectedId}
                onClick={() => setSelectedId(proposal.id)}
              />
            ))
          )}
        </div>

        {/* Right detail panel */}
        <div className="flex-1 min-w-0">
          {selectedProposal ? (
            <ProposalDetail
              proposal={selectedProposal}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <span className="text-4xl">👈</span>
              <p className="text-sm">Sélectionnez une proposition</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
