'use client'

import { useState } from 'react'
import NewArrivageModal from './NewArrivageModal'

export default function StockPageClient() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
      >
        <span>+</span>
        Nouvel arrivage
      </button>

      {showModal && <NewArrivageModal onClose={() => setShowModal(false)} />}
    </>
  )
}
