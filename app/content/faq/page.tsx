'use client'

import { useState, useMemo } from 'react'

// Types
type FAQItem = {
  id: string
  question: string
  answer: string
  category: string
  published: boolean
  display_order: number
}

type Category = 'Tous' | 'Produit' | 'Fonctionnement' | 'Application' | 'Abonnement' | 'Sécurité' | 'Livraison'

const CATEGORIES: Category[] = ['Tous', 'Produit', 'Fonctionnement', 'Application', 'Abonnement', 'Sécurité', 'Livraison']

const CATEGORY_COLORS: Record<string, string> = {
  Produit: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Fonctionnement: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Application: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Abonnement: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Sécurité': 'bg-green-500/20 text-green-300 border-green-500/30',
  Livraison: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

// Mock data — 25 FAQs
const INITIAL_FAQS: FAQItem[] = [
  // Produit
  { id: '1', question: 'Quel âge pour utiliser Buddy ?', answer: "Buddy est conçu pour les enfants de 4 à 8 ans. L'interface 100% vocale (pas de texte à lire, pas d'écran) le rend intuitif dès 4 ans. Des parents l'utilisent aussi avec des enfants jusqu'à 10-12 ans.", category: 'Produit', published: true, display_order: 1 },
  { id: '2', question: 'Quelle est la différence avec un smartphone ?', answer: "Buddy n'a pas d'écran, pas d'accès internet, pas de jeux, pas de réseaux sociaux. C'est uniquement un outil de communication sécurisé : messages vocaux + GPS + SOS. Zéro distraction, 100% connexion familiale.", category: 'Produit', published: true, display_order: 2 },
  { id: '3', question: "Buddy est-il résistant ? Mon enfant est brutal.", answer: "Oui ! Buddy est certifié IP67 (étanche jusqu'à 1m pendant 30 min) et résiste aux chutes jusqu'à 1,5m. Le boîtier est en ABS renforcé avec surmoulage silicone. Il est conçu pour la vie d'un enfant.", category: 'Produit', published: true, display_order: 3 },
  { id: '4', question: 'Quelles sont les dimensions de Buddy ?', answer: "Buddy mesure 80×60×20mm et pèse 150g. C'est le format d'un walkie-talkie — facile à tenir dans une petite main, à glisser dans un sac ou à accrocher à une cordelette.", category: 'Produit', published: true, display_order: 4 },
  { id: '5', question: 'Combien de personnalités sont disponibles ?', answer: '6 personnalités au lancement : Léo le Lion 🦁, Bella le Lapin 🐰, Luna la Licorne 🦄, Rex le Dino 🦖, Finn le Requin 🦈, et Pao le Panda 🐼. Chaque Buddy a sa couleur signature.', category: 'Produit', published: true, display_order: 5 },
  // Fonctionnement
  { id: '6', question: 'Comment envoyer un message vocal ?', answer: "C'est simple : l'enfant appuie sur le grand bouton PTT (Push-To-Talk), parle, puis relâche. La barre LED se remplit pendant qu'il parle, puis une animation lumineuse \"envoie\" le message. Le destinataire le reçoit instantanément.", category: 'Fonctionnement', published: true, display_order: 1 },
  { id: '7', question: 'Comment fonctionne le GPS ?', answer: "Buddy intègre un module GPS qui transmet la position toutes les 30 secondes (configurable). Les parents voient la position en temps réel sur la carte dans l'app. L'historique des positions est conservé 7 jours.", category: 'Fonctionnement', published: true, display_order: 2 },
  { id: '8', question: 'Comment déclencher une alerte SOS ?', answer: "L'enfant fait une double pression rapide sur le bouton PTT, puis maintient 3 secondes (total ~4s). C'est assez long pour éviter les déclenchements accidentels, mais simple à mémoriser. Une vibration courte confirme l'envoi.", category: 'Fonctionnement', published: true, display_order: 3 },
  { id: '9', question: 'Combien de contacts peut-on enregistrer ?', answer: "Maximum 5 contacts par Buddy. L'enfant navigue entre les contacts avec un bouton dédié et entend l'annonce vocale (\"Maman\", \"Papa\", \"Mamie\"...) avant d'appuyer sur PTT.", category: 'Fonctionnement', published: true, display_order: 4 },
  { id: '10', question: "Quelle est l'autonomie de la batterie ?", answer: "L'objectif est 1 semaine d'utilisation normale (2-4 messages/jour, GPS actif). La recharge se fait via USB-C. Une LED indique le niveau batterie, et les parents reçoivent une notification à 20%.", category: 'Fonctionnement', published: true, display_order: 5 },
  // Application
  { id: '11', question: "L'application est disponible sur quels appareils ?", answer: "L'application Buddy est disponible sur iOS (iPhone) et Android. Elle est gratuite à télécharger — l'abonnement Buddy est nécessaire pour activer la connectivité.", category: 'Application', published: true, display_order: 1 },
  { id: '12', question: "Combien de parents peuvent accéder à l'app ?", answer: "Autant que vous voulez ! Un compte famille peut être partagé avec les deux parents, les grands-parents, la nounou... Chaque adulte de confiance peut voir la position et écouter les messages.", category: 'Application', published: true, display_order: 2 },
  { id: '13', question: 'Peut-on gérer plusieurs Buddy dans une app ?', answer: "Oui, jusqu'à 5 Buddy par compte famille. Idéal si vous avez plusieurs enfants.", category: 'Application', published: true, display_order: 3 },
  { id: '14', question: 'Comment configurer les zones géographiques ?', answer: "Dans l'app, tu dessines des zones sur la carte (cercle ou polygone). Tu peux en créer autant que tu veux : école, maison, chez les grands-parents... Tu choisis si tu veux une alerte à l'entrée, à la sortie, ou les deux.", category: 'Application', published: true, display_order: 4 },
  { id: '15', question: "Peut-on répondre à l'enfant depuis l'app ?", answer: "Oui ! Les parents peuvent envoyer un message vocal à l'enfant directement depuis l'app. Le Buddy de l'enfant joue le message automatiquement via le haut-parleur.", category: 'Application', published: true, display_order: 5 },
  // Abonnement
  { id: '16', question: 'Combien coûte Buddy ?', answer: "Le device coûte 119€ (achat unique, port offert en France). L'abonnement connectivité est de 4,99€/mois (ou 6,99€/mois avec roaming Europe). Sans abonnement, le GPS et les messages ne fonctionnent pas.", category: 'Abonnement', published: true, display_order: 1 },
  { id: '17', question: "L'abonnement est-il sans engagement ?", answer: "Oui, l'abonnement est sans engagement. Tu peux l'annuler à tout moment depuis l'app ou depuis ton compte en ligne. La résiliation prend effet à la fin de la période en cours.", category: 'Abonnement', published: true, display_order: 2 },
  { id: '18', question: "Y a-t-il une période d'essai gratuite ?", answer: "Oui ! 30 jours d'essai gratuit à l'activation. Si tu n'es pas satisfait, tu es remboursé intégralement — device inclus.", category: 'Abonnement', published: true, display_order: 3 },
  { id: '19', question: 'Le roaming international est-il inclus ?', answer: "Le plan standard (4,99€/mois) fonctionne en France métropolitaine. Pour le roaming Europe, c'est 6,99€/mois. Une option roaming international est en développement.", category: 'Abonnement', published: false, display_order: 4 },
  // Sécurité
  { id: '20', question: "Qui peut envoyer des messages à mon enfant ?", answer: "Uniquement les contacts que les parents ont configurés dans l'app (max 5). Buddy est un système fermé — il est impossible de recevoir un message d'un inconnu.", category: 'Sécurité', published: true, display_order: 1 },
  { id: '21', question: 'Les messages sont-ils chiffrés ?', answer: "Oui. Tous les messages transitent via notre cloud sécurisé avec chiffrement TLS. Les messages vocaux sont stockés 30 jours puis supprimés automatiquement. Les clips SOS sont conservés 90 jours.", category: 'Sécurité', published: true, display_order: 2 },
  { id: '22', question: 'Mon enfant peut-il accéder à internet avec Buddy ?', answer: "Non, il est techniquement impossible. Buddy n'a pas de navigateur, pas d'app store, pas d'accès aux réseaux. La connexion 4G est utilisée uniquement pour les messages et le GPS.", category: 'Sécurité', published: true, display_order: 3 },
  // Livraison
  { id: '23', question: 'Quand sera livré Buddy ?', answer: "Les premiers Buddy sont attendus pour l'été 2026. Les précommandes seront honorées par ordre d'arrivée.", category: 'Livraison', published: true, display_order: 1 },
  { id: '24', question: 'Livrez-vous en dehors de France ?', answer: "Au lancement, nous livrons en France métropolitaine. La livraison en Belgique, Suisse et Luxembourg est prévue pour fin 2026.", category: 'Livraison', published: true, display_order: 2 },
  { id: '25', question: 'Puis-je annuler ma précommande ?', answer: "Oui, tu peux annuler ta précommande à tout moment avant l'expédition et être remboursé intégralement sous 5 jours ouvrés.", category: 'Livraison', published: true, display_order: 3 },
]

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// Modal component
function FAQModal({
  faq,
  onSave,
  onClose,
}: {
  faq: Partial<FAQItem> | null
  onSave: (item: FAQItem) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<FAQItem>>(
    faq ?? { question: '', answer: '', category: 'Produit', published: true, display_order: 0 }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question?.trim() || !form.answer?.trim() || !form.category) return
    onSave({
      id: form.id ?? generateId(),
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category,
      published: form.published ?? true,
      display_order: form.display_order ?? 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {faq?.id ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Question *
            </label>
            <input
              type="text"
              value={form.question ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="Ex: Quel âge pour utiliser Buddy ?"
              required
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Réponse */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Réponse *
            </label>
            <textarea
              value={form.answer ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              placeholder="Réponse détaillée..."
              required
              rows={6}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            />
          </div>

          {/* Catégorie + Ordre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Catégorie *
              </label>
              <select
                value={form.category ?? 'Produit'}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.filter((c) => c !== 'Tous').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ordre d&apos;affichage
              </label>
              <input
                type="number"
                min={0}
                value={form.display_order ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Publié toggle */}
          <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Publié</p>
              <p className="text-xs text-slate-400">Visible sur le site web</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.published ? 'bg-indigo-500' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.published ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-900/30"
            >
              {faq?.id ? 'Enregistrer' : 'Créer la FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Toast component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-800 border border-white/10 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2">
      <span className="text-green-400 text-lg">✓</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white text-lg leading-none">×</button>
    </div>
  )
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS)
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tous')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Stats
  const totalCount = faqs.length
  const publishedCount = faqs.filter((f) => f.published).length
  const categoryStats = useMemo(() => {
    const cats: Record<string, number> = {}
    faqs.forEach((f) => {
      cats[f.category] = (cats[f.category] ?? 0) + 1
    })
    return cats
  }, [faqs])

  // Filtered list
  const filtered = useMemo(() => {
    return faqs
      .filter((f) => selectedCategory === 'Tous' || f.category === selectedCategory)
      .filter((f) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category)
        return a.display_order - b.display_order
      })
  }, [faqs, selectedCategory, search])

  // CRUD handlers
  const handleSave = (item: FAQItem) => {
    setFaqs((prev) => {
      const exists = prev.find((f) => f.id === item.id)
      if (exists) return prev.map((f) => (f.id === item.id ? item : f))
      return [...prev, item]
    })
    setModalOpen(false)
    setEditingFaq(null)
    showToast(editingFaq ? 'FAQ mise à jour !' : 'FAQ créée avec succès !')
  }

  const handleTogglePublished = (id: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, published: !f.published } : f)))
  }

  const handleDelete = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id))
    setDeleteConfirm(null)
    showToast('FAQ supprimée.')
  }

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    setFaqs((prev) => {
      const item = prev.find((f) => f.id === id)
      if (!item) return prev
      const sameCat = prev
        .filter((f) => f.category === item.category)
        .sort((a, b) => a.display_order - b.display_order)
      const idx = sameCat.findIndex((f) => f.id === id)
      if (direction === 'up' && idx === 0) return prev
      if (direction === 'down' && idx === sameCat.length - 1) return prev
      const swapWith = direction === 'up' ? sameCat[idx - 1] : sameCat[idx + 1]
      return prev.map((f) => {
        if (f.id === id) return { ...f, display_order: swapWith.display_order }
        if (f.id === swapWith.id) return { ...f, display_order: item.display_order }
        return f
      })
    })
  }

  const openCreate = () => {
    setEditingFaq(null)
    setModalOpen(true)
  }

  const openEdit = (faq: FAQItem) => {
    setEditingFaq(faq)
    setModalOpen(true)
  }

  const handleSync = () => {
    showToast('Déployé automatiquement via Vercel !')
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} questions · {publishedCount} publiées</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span>🔄</span>
            Sync site web
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span>+</span>
            Nouvelle FAQ
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total FAQs</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-1">Questions enregistrées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Publiées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{publishedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Visibles sur le site</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Non publiées</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">{totalCount - publishedCount}</p>
          <p className="text-xs text-gray-400 mt-1">En brouillon</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Catégories</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{Object.keys(categoryStats).length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {Object.entries(categoryStats).map(([k, v]) => `${k} (${v})`).join(' · ')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher dans les FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
              {cat !== 'Tous' && categoryStats[cat] ? (
                <span className="ml-1.5 opacity-70">({categoryStats[cat]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {selectedCategory !== 'Tous' ? ` · ${selectedCategory}` : ''}
            {search ? ` · "${search}"` : ''}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Catégorie</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Question</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Ordre</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    Aucune FAQ trouvée.
                  </td>
                </tr>
              )}
              {filtered.map((faq) => {
                const sameCatItems = faqs
                  .filter((f) => f.category === faq.category)
                  .sort((a, b) => a.display_order - b.display_order)
                const idx = sameCatItems.findIndex((f) => f.id === faq.id)
                const isFirst = idx === 0
                const isLast = idx === sameCatItems.length - 1

                return (
                  <tr key={faq.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CATEGORY_COLORS[faq.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {faq.category}
                      </span>
                    </td>
                    {/* Question */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 leading-snug line-clamp-1">{faq.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{faq.answer}</p>
                    </td>
                    {/* Published toggle */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleTogglePublished(faq.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          faq.published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${faq.published ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {faq.published ? 'Publié' : 'Masqué'}
                      </button>
                    </td>
                    {/* Order */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 w-4 text-center">{faq.display_order}</span>
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMoveOrder(faq.id, 'up')}
                            disabled={isFirst}
                            className="w-5 h-4 flex items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none transition-colors"
                            title="Monter"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveOrder(faq.id, 'down')}
                            disabled={isLast}
                            className="w-5 h-4 flex items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] leading-none transition-colors"
                            title="Descendre"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(faq)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(faq.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Supprimer la FAQ ?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Cette action est irréversible. La question sera définitivement supprimée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <FAQModal
          faq={editingFaq}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingFaq(null) }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
