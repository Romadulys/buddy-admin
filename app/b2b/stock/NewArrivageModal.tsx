'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const SUPPLIERS = [
  'Shenzhen Tech Manufacturing',
  'Guangzhou Accessories Co.',
  'Autre fournisseur',
]

const PRODUCTS = [
  'Buddy Mini',
  'Buddy Big',
  'Chargeur USB-C',
  'Bracelet silicone coloré',
  'Starter Pack (Mini + bracelet)',
  'Présentoir retail x10',
]

const STATUSES = [
  { value: 'en_production', label: 'En production' },
  { value: 'en_transit', label: 'En transit' },
  { value: 'dedouanement', label: 'Dédouanement' },
  { value: 'livre', label: 'Livré' },
]

export default function NewArrivageModal({ onClose }: Props) {
  const [form, setForm] = useState({
    supplier: SUPPLIERS[0],
    product_name: PRODUCTS[0],
    quantity: '',
    unit_cost: '',
    order_date: new Date().toISOString().split('T')[0],
    estimated_arrival: '',
    status: 'en_production',
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production this would call the API; for now we just show success
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const totalCost =
    form.quantity && form.unit_cost
      ? (parseFloat(form.quantity) * parseFloat(form.unit_cost)).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        })
      : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvel arrivage fournisseur</h2>
            <p className="text-sm text-gray-500 mt-0.5">Enregistrer une commande fournisseur</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {saved ? (
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-semibold text-gray-900">Arrivage enregistré !</p>
            <p className="text-sm text-gray-500 mt-1">La commande fournisseur a été ajoutée.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {SUPPLIERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Produit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
              <select
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Quantité + Prix unitaire */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="ex: 5000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_cost}
                  onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                  placeholder="ex: 34"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Total estimé */}
            {totalCost && (
              <div className="bg-indigo-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-indigo-600 font-medium">Coût total estimé</span>
                <span className="text-sm font-bold text-indigo-700">{totalCost}</span>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de commande</label>
                <input
                  type="date"
                  value={form.order_date}
                  onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée estimée</label>
                <input
                  type="date"
                  value={form.estimated_arrival}
                  onChange={(e) => setForm({ ...form, estimated_arrival: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      form.status === s.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Conteneur, conditions, contacts..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                Enregistrer l'arrivage
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
