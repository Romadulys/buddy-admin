'use client'

import { useState, useEffect, useCallback } from 'react'
import AssetCard from './AssetCard'
import AssetUploadModal from './AssetUploadModal'

interface Asset {
  id: string
  category: string
  name: string
  file_url: string
  file_type: string
  file_size: number | null
  tags: string[]
  usage_notes: string | null
  uploaded_at: string
}

const CATEGORIES = [
  { value: 'logo', label: 'Logo' },
  { value: 'photo', label: 'Photo' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'template', label: 'Template' },
  { value: 'font', label: 'Police' },
  { value: 'icon', label: 'Icone' },
]

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const fetchAssets = useCallback(async (category?: string | null) => {
    try {
      const url = category
        ? `/api/marketing/brand/assets?category=${category}`
        : '/api/marketing/brand/assets'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setAssets(data.assets ?? data ?? [])
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets(activeCategory)
  }, [fetchAssets, activeCategory])

  const handleUpload = async (asset: {
    category: string
    name: string
    file_url: string
    file_type: string
    tags: string[]
    usage_notes: string | null
  }) => {
    try {
      const res = await fetch('/api/marketing/brand/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      })
      if (!res.ok) throw new Error('Upload error')
      setShowUpload(false)
      await fetchAssets(activeCategory)
    } catch (err) {
      console.error('Upload error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/marketing/brand/assets/${id}`, { method: 'DELETE' })
      setAssets((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📁 Bibliotheque d&apos;assets</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          ➕ Ajouter
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === null
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
          <span className="text-4xl">📁</span>
          <p className="text-sm">Aucun asset</p>
          <button
            onClick={() => setShowUpload(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Ajouter votre premier asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <AssetUploadModal onUpload={handleUpload} onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}
