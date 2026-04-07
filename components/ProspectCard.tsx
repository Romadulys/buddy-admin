'use client'

import { Prospect, STRUCTURE_COLORS, STRUCTURE_LABELS, formatEur } from '@/lib/pipeline-mock'

interface ProspectCardProps {
  prospect: Prospect
  onClick: (prospect: Prospect) => void
}

function formatRelance(dateStr: string): { label: string; overdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const relance = new Date(dateStr)
  relance.setHours(0, 0, 0, 0)

  const overdue = relance < today

  const label = relance.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return { label, overdue }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)
}

export default function ProspectCard({ prospect, onClick }: ProspectCardProps) {
  const { label: relanceLabel, overdue } = formatRelance(prospect.date_relance)
  const showCity = prospect.type_structure === 'magasin' || prospect.type_structure === 'independant'
  const showStores =
    prospect.type_structure === 'centrale' || prospect.type_structure === 'groupement'

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('prospectId', prospect.id)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(prospect)}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer select-none hover:shadow-md hover:border-indigo-200 transition-all"
    >
      {/* Entreprise name */}
      <p className="font-semibold text-gray-900 text-sm mb-2 truncate">{prospect.entreprise}</p>

      {/* Type structure badge */}
      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${STRUCTURE_COLORS[prospect.type_structure]}`}
      >
        {STRUCTURE_LABELS[prospect.type_structure]}
      </span>

      {/* Location or store count */}
      {showCity && (
        <p className="text-xs text-gray-500 mb-1">{prospect.ville}</p>
      )}
      {showStores && prospect.nb_points_de_vente != null && (
        <p className="text-xs text-gray-500 mb-1">{prospect.nb_points_de_vente} magasins</p>
      )}

      {/* Montant estimé */}
      <p className="text-xs text-gray-700 mb-2">~{formatEur(prospect.montant_estime)}</p>

      {/* Footer: relance date + assignee initials */}
      <div className="flex items-center justify-between mt-1">
        {overdue ? (
          <span className="text-xs font-medium text-red-600">Relance !</span>
        ) : (
          <span className="text-xs text-gray-500">Relance : {relanceLabel}</span>
        )}

        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex-shrink-0">
          {getInitials(prospect.assigne_a)}
        </span>
      </div>
    </div>
  )
}
