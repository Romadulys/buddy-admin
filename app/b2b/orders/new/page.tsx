'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { mockB2BClients, formatEur } from '@/lib/b2b-mock'

interface LineItem {
  id: number
  product_name: string
  product_type: string
  quantity: number
  unit_price: number
}

const PRODUCTS = [
  { name: 'Buddy Mini', type: 'mini', default_price: 89 },
  { name: 'Buddy Big', type: 'big', default_price: 129 },
  { name: 'Chargeur USB-C', type: 'accessory', default_price: 22.8 },
  { name: 'Starter Pack', type: 'accessory', default_price: 92 },
  { name: 'Présentoir retail', type: 'accessory', default_price: 1000 },
]

// Generate next order number based on existing mock data
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  return `CMD-${year}-006`
}

export default function NewOrderPage() {
  const [clientId, setClientId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, product_name: 'Buddy Mini', product_type: 'mini', quantity: 1, unit_price: 89 },
  ])
  const [nextId, setNextId] = useState(2)

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = subtotal * 0.2
  const total = subtotal + taxAmount

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: nextId, product_name: 'Buddy Mini', product_type: 'mini', quantity: 1, unit_price: 89 },
    ])
    setNextId((n) => n + 1)
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (field === 'product_name') {
          const product = PRODUCTS.find((p) => p.name === value)
          return {
            ...item,
            product_name: value as string,
            product_type: product?.type ?? item.product_type,
            unit_price: product?.default_price ?? item.unit_price,
          }
        }
        return { ...item, [field]: value }
      })
    )
  }

  const handleSaveDraft = () => {
    alert(`✅ Commande sauvegardée en brouillon\nN° : ${generateOrderNumber()}\n\nFonctionnalité de persistance Supabase à connecter.`)
  }

  const handleCreate = () => {
    if (!clientId) {
      alert('⚠️ Veuillez sélectionner un client.')
      return
    }
    if (items.length === 0) {
      alert('⚠️ Ajoutez au moins un article.')
      return
    }
    alert(`✅ Commande créée avec succès !\nN° : ${generateOrderNumber()}\nClient : ${mockB2BClients.find((c) => c.id === clientId)?.company_name}\nMontant TTC : ${formatEur(total)}\n\nFonctionnalité de persistance Supabase à connecter.`)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/b2b/orders"
            className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            ← Commandes
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">Nouvelle commande</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-600">
          {generateOrderNumber()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Client Selection */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🏢 Client
            </h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Sélectionner un client *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">-- Choisir un partenaire --</option>
                {mockB2BClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name} — {client.city}
                  </option>
                ))}
              </select>
            </div>
            {clientId && (
              <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                {(() => {
                  const c = mockB2BClients.find((c) => c.id === clientId)
                  if (!c) return null
                  return (
                    <div className="space-y-0.5 text-indigo-800">
                      <p className="font-semibold">{c.company_name}</p>
                      <p className="text-xs text-indigo-600">{c.contact_name} — {c.contact_email}</p>
                      {c.address && <p className="text-xs text-indigo-600">{c.address}</p>}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                📦 Articles
              </h2>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Ajouter un article
              </button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                <div className="col-span-5">Produit</div>
                <div className="col-span-2 text-right">Qté</div>
                <div className="col-span-3 text-right">P.U. HT (€)</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <select
                      value={item.product_name}
                      onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-right text-xs font-semibold text-gray-700">
                    {formatEur(item.quantity * item.unit_price)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm">Aucun article — cliquez sur "+ Ajouter un article"</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">📅 Livraison &amp; notes</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date de livraison souhaitée</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes internes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remise volume, conditions particulières, instructions spéciales..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar: Totals & Actions */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-700">Récapitulatif</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span>
                <span className="font-medium">{formatEur(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA (20%)</span>
                <span className="font-medium">{formatEur(taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                <span>Total TTC</span>
                <span className="text-indigo-600">{formatEur(total)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleCreate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                ✅ Créer la commande
              </button>
              <button
                onClick={handleSaveDraft}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                💾 Sauvegarder en brouillon
              </button>
              <Link
                href="/b2b/orders"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1"
              >
                Annuler
              </Link>
            </div>

            {/* Info */}
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 space-y-1">
              <p>N° auto-généré : <span className="font-mono font-semibold">{generateOrderNumber()}</span></p>
              <p>{items.length} article{items.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Products Reference */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Tarifs catalogue
            </h3>
            <div className="space-y-1.5">
              {PRODUCTS.map((p) => (
                <div key={p.name} className="flex justify-between text-xs">
                  <span className="text-gray-600">{p.name}</span>
                  <span className="font-semibold text-gray-800">{formatEur(p.default_price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
