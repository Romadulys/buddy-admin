'use client'

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

const CATEGORY_LABELS: Record<string, string> = {
  logo: 'Logo',
  photo: 'Photo',
  illustration: 'Illustration',
  template: 'Template',
  font: 'Police',
  icon: 'Icone',
}

const IMAGE_TYPES = ['image/svg+xml', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp']

function formatSize(bytes: number | null): string {
  if (bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isImage(fileType: string): boolean {
  return IMAGE_TYPES.some((t) => fileType.toLowerCase().includes(t))
}

interface AssetCardProps {
  asset: Asset
  onDelete: (id: string) => void
}

export default function AssetCard({ asset, onDelete }: AssetCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Supprimer "${asset.name}" ?`)) {
      onDelete(asset.id)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Preview */}
      {isImage(asset.file_type) ? (
        <img
          src={asset.file_url}
          alt={asset.name}
          className="h-40 w-full object-cover bg-slate-100"
        />
      ) : (
        <div className="h-40 w-full bg-slate-100 flex items-center justify-center">
          <span className="text-4xl text-slate-400">
            {asset.file_type.includes('pdf') ? '📄' : asset.file_type.includes('font') || asset.file_type.includes('ttf') || asset.file_type.includes('woff') ? '🔤' : '📁'}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-900 text-sm leading-snug">{asset.name}</p>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {CATEGORY_LABELS[asset.category] ?? asset.category}
          </span>
        </div>

        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto">
          {asset.file_size !== null && <span>{formatSize(asset.file_size)}</span>}
          <span className="ml-auto">{formatDate(asset.uploaded_at)}</span>
        </div>

        <button
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-700 text-left transition-colors mt-1"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
