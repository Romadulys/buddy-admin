'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  mockOrders,
  mockB2BClients,
  mockDeliveries,
  formatEur,
  ORDER_STATUS_COLORS,
  DELIVERY_STATUS_COLORS,
  STATUS_LABELS,
  getClientById,
  getDeliveryByOrderId,
} from '@/lib/b2b-mock'

type Tab = 'detail' | 'bon_commande' | 'facture' | 'livraison'

const DELIVERY_STEPS = [
  { key: 'confirmed', label: 'Commande confirmée' },
  { key: 'preparing', label: 'Préparation' },
  { key: 'shipped', label: 'Expédié' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'delivered', label: 'Livré' },
]

function getDeliveryStepIndex(status: string): number {
  const map: Record<string, number> = {
    confirmed: 0,
    preparing: 1,
    shipped: 2,
    in_transit: 3,
    delivered: 4,
  }
  return map[status] ?? -1
}

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) ?? 'detail'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const order = mockOrders.find((o) => o.id === params.id)

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-semibold">Commande introuvable</p>
          <Link href="/b2b/orders" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            ← Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  const client = getClientById(order.client_id)
  const delivery = getDeliveryByOrderId(order.id)

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'detail', label: 'Détail commande', icon: '📋' },
    { key: 'bon_commande', label: 'Bon de commande', icon: '📄' },
    { key: 'facture', label: 'Facture', icon: '🧾' },
    { key: 'livraison', label: 'Livraison', icon: '🚚' },
  ]

  return (
    <div className="p-6 space-y-5">
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
          <span className="font-mono font-semibold text-gray-900">{order.order_number}</span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Créé le {new Date(order.order_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* Tab 1: Détail commande */}
      {/* ============================================================ */}
      {activeTab === 'detail' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Client Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {order.client_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight">{order.client_name}</p>
                  {client && (
                    <>
                      <p className="text-sm text-gray-600 mt-1">{client.contact_name}</p>
                      <p className="text-sm text-indigo-600">{client.contact_email}</p>
                      <p className="text-sm text-gray-500">{client.contact_phone}</p>
                      {client.address && (
                        <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informations commande</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">N° Commande</p>
                  <p className="font-mono font-bold text-gray-900">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Statut</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      ORDER_STATUS_COLORS[order.status]
                    }`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date commande</p>
                  <p className="font-medium text-gray-700">
                    {new Date(order.order_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Livraison prévue</p>
                  <p className="font-medium text-gray-700">
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString('fr-FR')
                      : '—'}
                  </p>
                </div>
                {order.invoice_number && (
                  <>
                    <div>
                      <p className="text-gray-400 text-xs">N° Facture</p>
                      <p className="font-mono font-bold text-purple-700">{order.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Date facture</p>
                      <p className="font-medium text-gray-700">
                        {order.invoice_date
                          ? new Date(order.invoice_date).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {order.notes && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800">
                  <span className="font-semibold">Note : </span>{order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Articles commandés</h3>
            </div>
            {order.items.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produit</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qté</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix unitaire HT</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          {item.product_type && (
                            <p className="text-xs text-gray-400 capitalize">{item.product_type}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-gray-700">
                          {item.quantity.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-600">
                          {formatEur(item.unit_price)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                          {formatEur(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="max-w-xs ml-auto space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total HT</span>
                      <span className="font-medium">{formatEur(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>TVA ({order.tax_rate ?? 20}%)</span>
                      <span className="font-medium">{formatEur(order.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                      <span>Total TTC</span>
                      <span className="text-indigo-600">{formatEur(order.total)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm">Aucun article — commande en brouillon</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {order.status === 'draft' && (
              <button
                onClick={() => alert('Fonctionnalité : Confirmer la commande')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                ✅ Confirmer la commande
              </button>
            )}
            {order.status === 'confirmed' && !order.invoice_number && (
              <button
                onClick={() => alert('Fonctionnalité : Générer la facture')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                🧾 Générer la facture
              </button>
            )}
            {['confirmed', 'invoiced'].includes(order.status) && !delivery && (
              <button
                onClick={() => alert('Fonctionnalité : Créer l\'ordre de livraison')}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                🚚 Créer l&apos;ordre de livraison
              </button>
            )}
            <button
              onClick={() => setActiveTab('bon_commande')}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              📄 Voir bon de commande
            </button>
            {order.invoice_number && (
              <button
                onClick={() => setActiveTab('facture')}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                🧾 Voir facture
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Tab 2: Bon de commande (printable document) */}
      {/* ============================================================ */}
      {activeTab === 'bon_commande' && (
        <div className="space-y-4">
          <div className="flex justify-end no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              🖨️ Imprimer / PDF
            </button>
          </div>

          {/* Document */}
          <div
            id="print-document"
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-4xl mx-auto print:shadow-none print:border-0 print:rounded-none"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow">
                    B
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">BUDDY</p>
                    <p className="text-xs text-gray-400">GPS Tracker — Paperclip SAS</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                  <p>Paperclip SAS</p>
                  <p>SIRET : 123 456 789 00012</p>
                  <p>TVA : FR12345678900</p>
                  <p>contact@getbuddy.fr</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  Bon de commande
                </p>
                <p className="text-xl font-bold text-indigo-600 mt-1">{order.order_number}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Date : {new Date(order.order_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {order.delivery_date && (
                  <p className="text-sm text-gray-500">
                    Livraison : {new Date(order.delivery_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-gray-900 mb-8" />

            {/* Client Block */}
            <div className="grid grid-cols-2 gap-10 mb-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Émetteur</p>
                <p className="font-bold text-gray-900">Paperclip SAS</p>
                <p className="text-sm text-gray-600">GPS Tracker Buddy</p>
                <p className="text-sm text-gray-600">123 Avenue de l&apos;Innovation</p>
                <p className="text-sm text-gray-600">75001 Paris, France</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Destinataire</p>
                <p className="font-bold text-gray-900">{order.client_name}</p>
                {client && (
                  <>
                    <p className="text-sm text-gray-600">{client.contact_name}</p>
                    {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                    <p className="text-sm text-gray-600">{client.city}, {client.country}</p>
                    <p className="text-sm text-gray-500">SIRET : {client.siret}</p>
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-4 py-3 font-semibold">Désignation</th>
                  <th className="text-right px-4 py-3 font-semibold">Qté</th>
                  <th className="text-right px-4 py-3 font-semibold">P.U. HT</th>
                  <th className="text-right px-4 py-3 font-semibold">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatEur(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatEur(item.total_price)}</td>
                  </tr>
                ))}
                {order.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">
                      Aucun article sur cette commande
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-10">
              <div className="w-72 border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 text-sm">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span className="font-semibold">{formatEur(order.subtotal)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm border-t border-gray-100">
                  <span className="text-gray-600">TVA ({order.tax_rate ?? 20}%)</span>
                  <span className="font-semibold">{formatEur(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-gray-900 text-white text-base font-bold border-t border-gray-200">
                  <span>TOTAL TTC</span>
                  <span>{formatEur(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400 space-y-1">
              <p>Paperclip SAS — Capital social 10 000 € — RCS Paris 123 456 789 — TVA FR12345678900</p>
              <p>Document généré par Buddy Admin — {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Tab 3: Facture */}
      {/* ============================================================ */}
      {activeTab === 'facture' && (
        <div className="space-y-4">
          {!order.invoice_number ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-lg font-semibold text-yellow-800">Facture non encore générée</p>
              <p className="text-sm text-yellow-700 mt-1">
                Statut requis : <strong>Confirmé</strong> — Statut actuel :{' '}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </p>
              {order.status === 'confirmed' && (
                <button
                  onClick={() => alert('Fonctionnalité : Générer la facture')}
                  className="mt-4 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  🧾 Générer la facture maintenant
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-end no-print">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  🖨️ Imprimer / PDF
                </button>
              </div>

              {/* Invoice Document */}
              <div
                id="print-document"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-4xl mx-auto print:shadow-none print:border-0 print:rounded-none"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow">
                        B
                      </div>
                      <div>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">BUDDY</p>
                        <p className="text-xs text-gray-400">GPS Tracker — Paperclip SAS</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                      <p>Paperclip SAS</p>
                      <p>SIRET : 123 456 789 00012</p>
                      <p>TVA : FR12345678900</p>
                      <p>contact@getbuddy.fr</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-purple-700 tracking-tight uppercase">
                      Facture
                    </p>
                    <p className="text-xl font-bold text-purple-600 mt-1">{order.invoice_number}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Date : {order.invoice_date
                        ? new Date(order.invoice_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Commande : <span className="font-mono font-semibold">{order.order_number}</span>
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-purple-700 mb-8" />

                {/* Client Block */}
                <div className="grid grid-cols-2 gap-10 mb-10">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Émetteur</p>
                    <p className="font-bold text-gray-900">Paperclip SAS</p>
                    <p className="text-sm text-gray-600">GPS Tracker Buddy</p>
                    <p className="text-sm text-gray-600">123 Avenue de l&apos;Innovation</p>
                    <p className="text-sm text-gray-600">75001 Paris, France</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Facturé à</p>
                    <p className="font-bold text-gray-900">{order.client_name}</p>
                    {client && (
                      <>
                        <p className="text-sm text-gray-600">{client.contact_name}</p>
                        {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                        <p className="text-sm text-gray-600">{client.city}, {client.country}</p>
                        <p className="text-sm text-gray-500">SIRET : {client.siret}</p>
                        {client.vat_number && (
                          <p className="text-sm text-gray-500">TVA : {client.vat_number}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-purple-700 text-white">
                      <th className="text-left px-4 py-3 font-semibold">Désignation</th>
                      <th className="text-right px-4 py-3 font-semibold">Qté</th>
                      <th className="text-right px-4 py-3 font-semibold">P.U. HT</th>
                      <th className="text-right px-4 py-3 font-semibold">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{item.quantity.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatEur(item.unit_price)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatEur(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-10">
                  <div className="w-72 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex justify-between px-4 py-2.5 bg-gray-50 text-sm">
                      <span className="text-gray-600">Sous-total HT</span>
                      <span className="font-semibold">{formatEur(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5 text-sm border-t border-gray-100">
                      <span className="text-gray-600">TVA ({order.tax_rate ?? 20}%)</span>
                      <span className="font-semibold">{formatEur(order.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 bg-purple-700 text-white text-base font-bold border-t border-gray-200">
                      <span>TOTAL TTC</span>
                      <span>{formatEur(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-1">Modalités de paiement</p>
                  <p>Paiement à 30 jours à réception de facture. Virement bancaire uniquement.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    En cas de retard de paiement, une pénalité de 3× le taux légal sera appliquée, ainsi qu&apos;une indemnité forfaitaire de 40 € pour frais de recouvrement.
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400 space-y-1">
                  <p>Paperclip SAS — Capital social 10 000 € — RCS Paris 123 456 789 — TVA FR12345678900</p>
                  <p>Document généré par Buddy Admin — {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* Tab 4: Livraison */}
      {/* ============================================================ */}
      {activeTab === 'livraison' && (
        <div className="space-y-5">
          {!delivery ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-5xl mb-4">🚚</p>
              <p className="text-lg font-semibold text-gray-700">Aucune livraison créée</p>
              <p className="text-sm text-gray-500 mt-1">
                La livraison sera créée une fois la commande confirmée et facturée.
              </p>
              {['confirmed', 'invoiced'].includes(order.status) && (
                <button
                  onClick={() => alert('Fonctionnalité : Créer l\'ordre de livraison')}
                  className="mt-5 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  🚚 Créer l&apos;ordre de livraison
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Delivery Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Livraison</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{delivery.delivery_number}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-2 ${
                      DELIVERY_STATUS_COLORS[delivery.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[delivery.status]}
                  </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Transporteur</p>
                  <p className="font-bold text-gray-900 text-lg">{delivery.carrier ?? '—'}</p>
                  {delivery.tracking_number && (
                    <p className="font-mono text-sm text-gray-500 mt-1">{delivery.tracking_number}</p>
                  )}
                  {delivery.tracking_url && (
                    <a
                      href={delivery.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
                    >
                      Suivre le colis →
                    </a>
                  )}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dates</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expédié le</span>
                      <span className="font-medium text-gray-800">
                        {delivery.shipped_at
                          ? new Date(delivery.shipped_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Livré le</span>
                      <span className="font-medium text-gray-800">
                        {delivery.delivered_at
                          ? new Date(delivery.delivered_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Adresse de livraison</p>
                <p className="text-gray-700">{delivery.delivery_address}</p>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-700 mb-6">Suivi de livraison</p>
                <div className="relative">
                  {/* Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {DELIVERY_STEPS.map((step, index) => {
                      const currentIndex = getDeliveryStepIndex(delivery.status)
                      const isDone = index <= currentIndex
                      const isCurrent = index === currentIndex
                      return (
                        <div key={step.key} className="flex items-center gap-4 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-sm font-bold flex-shrink-0 transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                : isDone
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {isDone && !isCurrent ? '✓' : index + 1}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isCurrent ? 'text-indigo-700' : isDone ? 'text-green-700' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                              {isCurrent && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                  Étape actuelle
                                </span>
                              )}
                            </p>
                            {step.key === 'shipped' && delivery.shipped_at && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(delivery.shipped_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                            {step.key === 'delivered' && delivery.delivered_at && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(delivery.delivered_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
