'use client'

import { useState } from 'react'

interface UploadAsset {
  category: string
  name: string
  file_url: string
  file_type: string
  tags: string[]
  usage_notes: string | null
}

interface AssetUploadModalProps {
  onUpload: (asset: UploadAsset) => void
  onClose: () => void
}

const CATEGORIES = [
  { value: 'logo', label: 'Logo' },
  { value: 'photo', label: 'Photo' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'template', label: 'Template' },
  { value: 'font', label: 'Police' },
  { value: 'icon', label: 'Icone' },
]

export default function AssetUploadModal({ onUpload, onClose }: AssetUploadModalProps) {
  const [form, setForm] = useState({
    name: '',
    category: 'logo',
    file_url: '',
    file_type: '',
    tags: '',
    usage_notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpload({
      name: form.name,
      category: form.category,
      file_url: form.file_url,
      file_type: form.file_type,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      usage_notes: form.usage_notes || null,
    })
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Ajouter un asset</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Logo principal SVG"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL du fichier</label>
            <input
              type="text"
              required
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://cdn.exemple.com/logo.svg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de fichier</label>
            <input
              type="text"
              required
              value={form.file_type}
              onChange={(e) => setForm({ ...form, file_type: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="svg, png, pdf..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (separés par virgule)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="branding, header, dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes d'utilisation (optionnel)</label>
            <textarea
              value={form.usage_notes}
              onChange={(e) => setForm({ ...form, usage_notes: e.target.value })}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Utiliser sur fond blanc uniquement..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              📁 Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
