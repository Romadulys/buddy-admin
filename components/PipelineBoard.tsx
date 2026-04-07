'use client'

import { useState } from 'react'
import { Prospect, ProspectStatut, PIPELINE_COLUMNS } from '@/lib/pipeline-mock'
import ProspectCard from './ProspectCard'

interface PipelineBoardProps {
  prospects: Prospect[]
  showLost: boolean
  onCardClick: (prospect: Prospect) => void
  onStatutChange: (id: string, newStatut: ProspectStatut) => void
}

const COLOR_MAP: Record<string, string> = {
  gray: 'bg-gray-200',
  blue: 'bg-blue-400',
  orange: 'bg-orange-400',
  purple: 'bg-purple-400',
  green: 'bg-green-400',
  red: 'bg-red-400',
}

const COLUMN_COLORS: Record<string, string> = {
  identifie: 'gray',
  contacte: 'blue',
  demo_rdv: 'purple',
  proposition: 'orange',
  gagne: 'green',
  perdu: 'red',
}

export default function PipelineBoard({
  prospects,
  showLost,
  onCardClick,
  onStatutChange,
}: PipelineBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const columns = showLost
    ? PIPELINE_COLUMNS
    : PIPELINE_COLUMNS.filter((col) => col.statut !== 'perdu')

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, statut: string) {
    e.preventDefault()
    setDragOverCol(statut)
  }

  function handleDragLeave() {
    setDragOverCol(null)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, statut: ProspectStatut) {
    e.preventDefault()
    setDragOverCol(null)
    const prospectId = e.dataTransfer.getData('prospectId')
    if (prospectId) {
      onStatutChange(prospectId, statut)
    }
  }

  return (
    <div
      className="flex flex-row gap-4 overflow-x-auto"
      style={{ minHeight: 'calc(100vh - 280px)' }}
    >
      {columns.map((col) => {
        const colProspects = prospects.filter((p) => p.statut === col.statut)
        const isDragOver = dragOverCol === col.statut
        const colorKey = COLUMN_COLORS[col.statut] ?? 'gray'
        const dotColor = COLOR_MAP[colorKey] ?? 'bg-gray-200'

        return (
          <div
            key={col.statut}
            className={`flex-shrink-0 w-[280px] rounded-xl ${
              isDragOver
                ? 'bg-indigo-50 ring-2 ring-indigo-300'
                : 'bg-gray-50'
            }`}
            onDragOver={(e) => handleDragOver(e, col.statut)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.statut)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
              </div>
              <span className="bg-white text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                {colProspects.length}
              </span>
            </div>

            {/* Cards area */}
            <div className="px-2 pb-3 space-y-2 min-h-[100px]">
              {colProspects.length === 0 ? (
                <div className="flex items-center justify-center min-h-[100px]">
                  <p className="text-xs text-gray-400 text-center">Glisser un prospect ici</p>
                </div>
              ) : (
                colProspects.map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onClick={onCardClick}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
