'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Catalog ──────────────────────────────────────────────────────────────────

interface CatalogItem {
  id: string
  name: string
  basePrice: number
  minOrder: number
  icon: string
  purchasePrice: number
  category: 'device' | 'accessory'
}

const CATALOG: CatalogItem[] = [
  { id: 'mini', name: 'Buddy Mini', basePrice: 89, minOrder: 1, icon: '📍', purchasePrice: 34, category: 'device' },
  { id: 'big', name: 'Buddy Big', basePrice: 129, minOrder: 1, icon: '📡', purchasePrice: 52, category: 'device' },
  { id: 'charger', name: 'Chargeur USB-C', basePrice: 12.90, minOrder: 10, icon: '🔌', purchasePrice: 4.5, category: 'accessory' },
  { id: 'bracelet', name: 'Bracelet silicone', basePrice: 8.90, minOrder: 20, icon: '💚', purchasePrice: 2.8, category: 'accessory' },
  { id: 'display', name: 'Présentoir retail', basePrice: 250, minOrder: 1, icon: '🏪', purchasePrice: 85, category: 'accessory' },
  { id: 'starter', name: 'Starter Pack', basePrice: 92, minOrder: 10, icon: '📦', purchasePrice: 38, category: 'accessory' },
]

// ─── Volume discount tiers ────────────────────────────────────────────────────

interface Tier {
  min: number
  max: number | null
  discount: number
  label: string
}

const TIERS: Tier[] = [
  { min: 1, max: 49, discount: 0, label: '1–49 unités' },
  { min: 50, max: 99, discount: 3, label: '50–99 unités' },
  { min: 100, max: 299, discount: 7, label: '100–299 unités' },
  { min: 300, max: 499, discount: 10, label: '300–499 unités' },
  { min: 500, max: 999, discount: 13, label: '500–999 unités' },
  { min: 1000, max: 1999, discount: 17, label: '1 000–1 999 unités' },
  { min: 2000, max: 4999, discount: 21, label: '2 000–4 999 unités' },
  { min: 5000, max: null, discount: 25, label: '5 000+ unités' },
]

// ─── Kit presets ──────────────────────────────────────────────────────────────

const KIT_PRESETS = [
  {
    label: '🏪 Kit Retail Standard',
    desc: '500 Mini + 500 accessoires',
    qtys: { mini: 500, big: 0, charger: 300, bracelet: 200, display: 0, starter: 0 },
  },
  {
    label: '🚀 Kit Lancement',
    desc: '200 Mini + 50 Big + accessoires',
    qtys: { mini: 200, big: 50, charger: 100, bracelet: 100, display: 2, starter: 0 },
  },
  {
    label: '🧪 Commande Test',
    desc: '50 Mini + accessoires',
    qtys: { mini: 50, big: 0, charger: 50, bracelet: 50, display: 0, starter: 0 },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

function getActiveTier(deviceQty: number): Tier {
  return [...TIERS].reverse().find((t) => deviceQty >= t.min) ?? TIERS[0]
}

function getNextTier(deviceQty: number): Tier | null {
  const idx = TIERS.findIndex((t) => t.min > deviceQty)
  return idx >= 0 ? TIERS[idx] : null
}

// ─── Email modal ──────────────────────────────────────────────────────────────

function EmailModal({
  onClose,
  catalogTotal,
  negotiatedTotal,
  discountPct,
}: {
  onClose: () => void
  catalogTotal: number
  negotiatedTotal: number
  discountPct: number
}) {
  const [sent, setSent] = useState(false)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Envoyer au client</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            ✕
          </button>
        </div>
        {sent ? (
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-lg font-semibold text-gray-900">Email envoyé !</p>
            <p className="text-sm text-gray-500 mt-1">Le devis a été transmis au client.</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
              <input
                type="email"
                defaultValue="contact@client.fr"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
              <input
                type="text"
                defaultValue="Devis Buddy — Commande B2B"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <p>Bonjour,</p>
              <p className="mt-2">
                Veuillez trouver ci-joint votre devis personnalisé Buddy.
              </p>
              <p className="mt-2">
                Prix catalogue HT : <strong>{eur(catalogTotal)}</strong>
              </p>
              <p>
                Remise accordée : <strong className="text-green-600">−{discountPct.toFixed(1)}%</strong>
              </p>
              <p>
                <strong>Prix négocié HT : {eur(negotiatedTotal)}</strong>
              </p>
            </div>
            <button
              onClick={() => setSent(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              📧 Envoyer le devis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(CATALOG.map((c) => [c.id, 0]))
  )
  const [quoteSaved, setQuoteSaved] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const setQty = (id: string, val: number) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(0, val) }))
  }

  const applyPreset = (preset: (typeof KIT_PRESETS)[number]) => {
    setQtys({ ...Object.fromEntries(CATALOG.map((c) => [c.id, 0])), ...preset.qtys })
  }

  // ── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const deviceQty = (qtys['mini'] ?? 0) + (qtys['big'] ?? 0)
    const accessoryQty = CATALOG.filter((c) => c.category === 'accessory').reduce(
      (s, c) => s + (qtys[c.id] ?? 0),
      0
    )
    const productLinesOrdered = CATALOG.filter((c) => (qtys[c.id] ?? 0) > 0).length

    // Volume discount
    const activeTier = getActiveTier(deviceQty)
    const nextTier = getNextTier(deviceQty)
    let volumeDiscount = activeTier.discount

    // Bundle bonus
    let bundleBonus = 0
    if (deviceQty > 0) {
      if (accessoryQty >= deviceQty * 2) bundleBonus = 3
      else if (accessoryQty >= deviceQty) bundleBonus = 2
    }

    // Multi-product bonus
    const multiBonus = productLinesOrdered >= 3 ? 1 : 0

    const totalDiscountPct = volumeDiscount + bundleBonus + multiBonus

    // Line totals
    const lines = CATALOG.map((c) => ({
      ...c,
      qty: qtys[c.id] ?? 0,
      lineTotal: (qtys[c.id] ?? 0) * c.basePrice,
      purchaseTotal: (qtys[c.id] ?? 0) * c.purchasePrice,
    })).filter((l) => l.qty > 0)

    const catalogTotal = lines.reduce((s, l) => s + l.lineTotal, 0)
    const totalDiscount = catalogTotal * (totalDiscountPct / 100)
    const negotiatedHT = catalogTotal - totalDiscount
    const vat = negotiatedHT * 0.2
    const totalTTC = negotiatedHT + vat

    // Cost basis (from purchase prices)
    const totalPurchaseCost = lines.reduce((s, l) => s + l.purchaseTotal, 0)
    const grossMargin = negotiatedHT - totalPurchaseCost
    const grossMarginPct = negotiatedHT > 0 ? (grossMargin / negotiatedHT) * 100 : 0

    // Progress to next tier
    const unitsToNextTier = nextTier ? nextTier.min - deviceQty : 0
    const nextTierSavings = nextTier
      ? catalogTotal * ((nextTier.discount - volumeDiscount) / 100)
      : 0

    const progressPct = nextTier
      ? Math.min(100, ((deviceQty - activeTier.min) / (nextTier.min - activeTier.min)) * 100)
      : 100

    return {
      deviceQty,
      accessoryQty,
      productLinesOrdered,
      activeTier,
      nextTier,
      volumeDiscount,
      bundleBonus,
      multiBonus,
      totalDiscountPct,
      lines,
      catalogTotal,
      totalDiscount,
      negotiatedHT,
      vat,
      totalTTC,
      totalPurchaseCost,
      grossMargin,
      grossMarginPct,
      unitsToNextTier,
      nextTierSavings,
      progressPct,
    }
  }, [qtys])

  const handleSaveQuote = () => {
    const quote = {
      id: `DEV-${Date.now()}`,
      date: new Date().toISOString(),
      lines: calc.lines,
      catalogTotal: calc.catalogTotal,
      discountPct: calc.totalDiscountPct,
      negotiatedHT: calc.negotiatedHT,
      totalTTC: calc.totalTTC,
    }
    try {
      const existing = JSON.parse(localStorage.getItem('buddy_quotes') ?? '[]')
      existing.push(quote)
      localStorage.setItem('buddy_quotes', JSON.stringify(existing))
    } catch {}
    setQuoteSaved(true)
    setTimeout(() => setQuoteSaved(false), 3000)
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* ── LEFT COLUMN: Configuration ──────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Simulateur de commande B2B</h1>
            <p className="text-sm text-gray-500 mt-0.5">Calculez votre prix en temps réel</p>
          </div>

          {/* Kit presets */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Kits préconfigurés
            </p>
            <div className="flex flex-wrap gap-2">
              {KIT_PRESETS.map((kit) => (
                <button
                  key={kit.label}
                  onClick={() => applyPreset(kit)}
                  className="flex flex-col items-start px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
                >
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">
                    {kit.label}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">{kit.desc}</span>
                </button>
              ))}
              <button
                onClick={() => setQtys(Object.fromEntries(CATALOG.map((c) => [c.id, 0])))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-500 hover:text-gray-700 transition-all"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Product rows */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Produit</div>
              <div className="col-span-3 text-center">Quantité</div>
              <div className="col-span-2 text-right">Prix unitaire</div>
              <div className="col-span-2 text-right">Sous-total</div>
            </div>

            {/* Devices group */}
            <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100/50">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                Appareils GPS
              </p>
            </div>
            {CATALOG.filter((c) => c.category === 'device').map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                qty={qtys[item.id] ?? 0}
                onChange={(v) => setQty(item.id, v)}
              />
            ))}

            {/* Accessories group */}
            <div className="px-4 py-2 bg-gray-50/70 border-y border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Accessoires
              </p>
            </div>
            {CATALOG.filter((c) => c.category === 'accessory').map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                qty={qtys[item.id] ?? 0}
                onChange={(v) => setQty(item.id, v)}
              />
            ))}

            {/* Footer total */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Total catalogue HT
              </span>
              <span className="text-lg font-bold text-gray-900">
                {eur(calc.catalogTotal)}
              </span>
            </div>
          </div>

          {/* Volume tier progress */}
          {calc.deviceQty > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Palier de remise volume
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tier actuel :{' '}
                    <span className="font-semibold text-indigo-600">
                      {calc.activeTier.label} — {calc.volumeDiscount}% de remise
                    </span>
                  </p>
                </div>
                {calc.totalDiscount > 0 && (
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <span className="text-green-600 font-bold text-sm">
                      Économies : {eur(calc.totalDiscount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${calc.progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>{calc.activeTier.min.toLocaleString('fr-FR')} u.</span>
                  {calc.nextTier && (
                    <span>{calc.nextTier.min.toLocaleString('fr-FR')} u.</span>
                  )}
                </div>
              </div>

              {calc.nextTier ? (
                <p className="mt-3 text-xs text-gray-600 bg-indigo-50 rounded-lg px-3 py-2">
                  Ajoutez{' '}
                  <strong className="text-indigo-700">
                    {calc.unitsToNextTier.toLocaleString('fr-FR')} unités
                  </strong>{' '}
                  pour atteindre le tier suivant (
                  <strong>{calc.nextTier.discount}%</strong>) et économiser{' '}
                  <strong className="text-green-600">
                    ~{eur(calc.nextTierSavings)} supplémentaires
                  </strong>
                  .
                </p>
              ) : (
                <p className="mt-3 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 font-medium">
                  Meilleur tarif atteint — remise maximale de 25% appliquée.
                </p>
              )}
            </div>
          )}

          {/* Discount tiers reference table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Grille tarifaire — Appareils GPS</p>
              <p className="text-xs text-gray-500 mt-0.5">Paliers de remise sur Buddy Mini + Buddy Big combinés</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Volume</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Remise</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mini (net HT)</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Big (net HT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TIERS.map((tier) => {
                    const isActive = tier === calc.activeTier && calc.deviceQty > 0
                    const isPast =
                      calc.deviceQty > 0 &&
                      calc.deviceQty >= tier.min &&
                      tier !== calc.activeTier
                    return (
                      <tr
                        key={tier.min}
                        className={`transition-colors ${
                          isActive
                            ? 'bg-indigo-50'
                            : isPast
                            ? 'bg-green-50/30'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                            )}
                            {!isActive && (
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                isPast ? 'bg-green-400' : 'bg-gray-200'
                              }`} />
                            )}
                            <span
                              className={`text-sm ${
                                isActive
                                  ? 'font-bold text-indigo-700'
                                  : isPast
                                  ? 'text-green-700 font-medium'
                                  : 'text-gray-600'
                              }`}
                            >
                              {tier.label}
                            </span>
                            {isActive && (
                              <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">
                                Actif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {tier.discount === 0 ? (
                            <span className="text-gray-400 text-xs">Aucune</span>
                          ) : (
                            <span
                              className={`font-bold ${
                                tier.discount >= 20
                                  ? 'text-green-600'
                                  : tier.discount >= 10
                                  ? 'text-orange-500'
                                  : 'text-gray-700'
                              }`}
                            >
                              −{tier.discount}%
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-gray-700">
                          {eur(89 * (1 - tier.discount / 100))}
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-gray-700">
                          {eur(129 * (1 - tier.discount / 100))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Quote card (sticky) ───────────────────────────── */}
        <div className="xl:col-span-2">
          <div className="xl:sticky xl:top-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              {/* Card header */}
              <div className="px-6 py-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  Votre commande
                </p>
                <p className="text-2xl font-bold">
                  {calc.totalTTC > 0 ? eur(calc.totalTTC) : '—'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {calc.totalTTC > 0 ? 'TTC (TVA 20% incluse)' : 'Ajoutez des produits'}
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Line items */}
                {calc.lines.length > 0 ? (
                  <div className="space-y-2">
                    {calc.lines.map((line) => (
                      <div key={line.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{line.icon}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{line.name}</p>
                            <p className="text-xs text-gray-400">
                              {line.qty.toLocaleString('fr-FR')} × {eur(line.basePrice)}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900 ml-3 flex-shrink-0">
                          {eur(line.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-3xl mb-2">🛒</p>
                    <p className="text-sm">Votre panier est vide</p>
                  </div>
                )}

                {calc.lines.length > 0 && (
                  <>
                    <div className="border-t border-gray-100" />

                    {/* Discount breakdown */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Remises appliquées
                      </p>

                      {/* Volume */}
                      <div className="flex items-start justify-between text-sm">
                        <div>
                          <p className="text-gray-700">Remise volume</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {calc.activeTier.label}
                          </p>
                        </div>
                        <span
                          className={`font-semibold ${
                            calc.volumeDiscount > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {calc.volumeDiscount > 0 ? `−${calc.volumeDiscount}%` : 'Aucune'}
                        </span>
                      </div>

                      {/* Bundle bonus */}
                      {calc.bundleBonus > 0 && (
                        <div className="flex items-start justify-between text-sm">
                          <div>
                            <p className="text-gray-700">Bonus accessoires</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {calc.accessoryQty >= calc.deviceQty * 2
                                ? '≥ 2× accessoires/appareil'
                                : '≥ 1× accessoire/appareil'}
                            </p>
                          </div>
                          <span className="font-semibold text-green-600">−{calc.bundleBonus}%</span>
                        </div>
                      )}

                      {/* Multi-product bonus */}
                      {calc.multiBonus > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-gray-700">Bonus multi-gamme</p>
                          <span className="font-semibold text-green-600">−1%</span>
                        </div>
                      )}

                      {/* Total discount */}
                      {calc.totalDiscountPct > 0 && (
                        <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                          <p className="text-sm font-bold text-green-800">Total remise</p>
                          <span className="text-sm font-bold text-green-700">
                            −{calc.totalDiscountPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Price breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Prix catalogue HT</span>
                        <span>{eur(calc.catalogTotal)}</span>
                      </div>

                      {calc.totalDiscount > 0 && (
                        <div className="flex justify-between text-sm font-semibold text-green-600">
                          <span>Remise totale</span>
                          <span>−{eur(calc.totalDiscount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-base font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2.5">
                        <span>Prix négocié HT</span>
                        <span>{eur(calc.negotiatedHT)}</span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>TVA 20%</span>
                        <span>{eur(calc.vat)}</span>
                      </div>

                      <div
                        className="flex justify-between text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl px-4 py-3 shadow-lg shadow-indigo-200"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <span>Total TTC</span>
                        <span>{eur(calc.totalTTC)}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Margin */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Marge estimée fournisseur
                      </p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Coût achat total</span>
                        <span>{eur(calc.totalPurchaseCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-900">
                        <span>Marge brute</span>
                        <div className="text-right">
                          <span className="text-green-600">{eur(calc.grossMargin)}</span>
                          <span className="text-xs text-gray-400 ml-1.5">
                            ({calc.grossMarginPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      {/* Margin bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, calc.grossMarginPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Savings badge */}
                    {calc.totalDiscount > 0 && (
                      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-3 px-4">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            Économies réalisées : {eur(calc.totalDiscount)}
                          </p>
                          <p className="text-xs text-green-600">
                            vs. prix catalogue public
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleSaveQuote}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          quoteSaved
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {quoteSaved ? '✅ Devis sauvegardé !' : '📋 Générer un devis'}
                      </button>

                      <button
                        onClick={() => setShowEmail(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        📧 Envoyer au client
                      </button>

                      <Link
                        href={`/b2b/orders/new?${new URLSearchParams({
                          mini: String(qtys['mini'] ?? 0),
                          big: String(qtys['big'] ?? 0),
                          total: String(Math.round(calc.negotiatedHT)),
                          discount: String(calc.totalDiscountPct),
                        }).toString()}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
                      >
                        ➕ Créer la commande
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEmail && (
        <EmailModal
          onClose={() => setShowEmail(false)}
          catalogTotal={calc.catalogTotal}
          negotiatedTotal={calc.negotiatedHT}
          discountPct={calc.totalDiscountPct}
        />
      )}
    </div>
  )
}

// ─── Product row sub-component ────────────────────────────────────────────────

function ProductRow({
  item,
  qty,
  onChange,
}: {
  item: CatalogItem
  qty: number
  onChange: (v: number) => void
}) {
  const lineTotal = qty * item.basePrice

  return (
    <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      {/* Product name */}
      <div className="col-span-5 flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{item.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          {item.minOrder > 1 && (
            <p className="text-xs text-gray-400">Min. {item.minOrder} u.</p>
          )}
        </div>
      </div>

      {/* Qty stepper */}
      <div className="col-span-3 flex items-center justify-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, qty - (item.minOrder > 1 ? item.minOrder : 1)))}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors flex items-center justify-center flex-shrink-0"
          aria-label="Diminuer"
        >
          −
        </button>
        <input
          type="number"
          min="0"
          value={qty === 0 ? '' : qty}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 0
            onChange(v)
          }}
          placeholder="0"
          className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={() => onChange(qty + (item.minOrder > 1 ? item.minOrder : 1))}
          className="w-8 h-8 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 font-bold text-sm transition-colors flex items-center justify-center flex-shrink-0"
          aria-label="Augmenter"
        >
          +
        </button>
      </div>

      {/* Unit price */}
      <div className="col-span-2 text-right">
        <span className="text-sm text-gray-600">{eur(item.basePrice)}</span>
      </div>

      {/* Line total */}
      <div className="col-span-2 text-right">
        <span
          className={`text-sm font-semibold transition-colors ${
            qty > 0 ? 'text-gray-900' : 'text-gray-300'
          }`}
        >
          {qty > 0 ? eur(lineTotal) : '—'}
        </span>
      </div>
    </div>
  )
}
