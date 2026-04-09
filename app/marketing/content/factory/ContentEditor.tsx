'use client'

import { useState, useEffect } from 'react'
import BriefPreview from './BriefPreview'

type ContentType = 'article' | 'social_post' | 'video_brief' | 'image_brief' | 'video_script' | 'ad_creative' | 'email'
type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published'

interface ContentItem {
  id: string
  proposal_id: string | null
  type: ContentType
  title: string
  body: Record<string, unknown>
  seo_data: Record<string, unknown>
  target_channels: string[]
  parent_content_id: string | null
  status: ContentStatus
  scheduled_for: string | null
  published_at: string | null
  published_url: string | null
  performance: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface Props {
  item: ContentItem
  onSave: (updates: Partial<ContentItem>) => void
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ContentEditor({ item, onSave }: Props) {
  const [body, setBody] = useState<Record<string, unknown>>(item.body ?? {})
  const [briefEditMode, setBriefEditMode] = useState(false)
  const [briefJson, setBriefJson] = useState('')
  const [briefJsonError, setBriefJsonError] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // Reset state when item changes
  useEffect(() => {
    setBody(item.body ?? {})
    setBriefEditMode(false)
    setBriefJsonError('')
    setIsDirty(false)
  }, [item.id])

  const handleBodyUpdate = (field: string, value: unknown) => {
    const updated = { ...body, [field]: value }
    setBody(updated)
    setIsDirty(true)
  }

  const handleSave = () => {
    onSave({ body })
    setIsDirty(false)
  }

  const handleBriefJsonEdit = () => {
    setBriefJson(JSON.stringify(body, null, 2))
    setBriefEditMode(true)
    setBriefJsonError('')
  }

  const handleBriefJsonSave = () => {
    try {
      const parsed = JSON.parse(briefJson)
      setBody(parsed)
      setIsDirty(true)
      setBriefEditMode(false)
      setBriefJsonError('')
    } catch {
      setBriefJsonError('JSON invalide — veuillez corriger la syntaxe')
    }
  }

  const articleText = String(body.content ?? body.text ?? body.markdown ?? '')
  const wordCount = countWords(articleText)
  const charCount = articleText.length

  const renderEditor = () => {
    switch (item.type) {
      case 'article':
        return (
          <div className="flex flex-col flex-1 gap-3">
            <textarea
              value={articleText}
              onChange={(e) => handleBodyUpdate('content', e.target.value)}
              placeholder="Contenu de l'article en Markdown..."
              className="flex-1 min-h-96 w-full px-4 py-3 text-sm text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed"
            />
            <div className="text-xs text-slate-400 text-right">
              {wordCount} mots · {charCount} caracteres
            </div>
          </div>
        )

      case 'social_post':
        return (
          <div className="flex flex-col gap-3">
            <textarea
              value={String(body.text ?? '')}
              onChange={(e) => handleBodyUpdate('text', e.target.value)}
              placeholder="Texte du post social..."
              rows={8}
              className="w-full px-4 py-3 text-sm text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div>
              <label className="text-xs text-slate-500 block mb-1">#Hashtags</label>
              <input
                type="text"
                value={String(body.hashtags ?? '')}
                onChange={(e) => handleBodyUpdate('hashtags', e.target.value)}
                placeholder="#buddy #enfant #application"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">URL media</label>
              <input
                type="url"
                value={String(body.media_url ?? '')}
                onChange={(e) => handleBodyUpdate('media_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )

      case 'video_brief':
      case 'image_brief':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                {item.type === 'video_brief' ? '🎬 Brief video' : '🖼️ Brief image'}
              </h3>
              {!briefEditMode && (
                <button
                  onClick={handleBriefJsonEdit}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Modifier le brief
                </button>
              )}
            </div>
            {briefEditMode ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={briefJson}
                  onChange={(e) => setBriefJson(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                {briefJsonError && (
                  <p className="text-xs text-red-600">{briefJsonError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleBriefJsonSave}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Valider JSON
                  </button>
                  <button
                    onClick={() => { setBriefEditMode(false); setBriefJsonError('') }}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <BriefPreview type={item.type} body={body} />
            )}
          </div>
        )

      case 'ad_creative':
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Accroche (Headline)</label>
              <input
                type="text"
                value={String(body.headline ?? '')}
                onChange={(e) => handleBodyUpdate('headline', e.target.value)}
                placeholder="Votre accroche principale..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Description</label>
              <textarea
                value={String(body.description ?? '')}
                onChange={(e) => handleBodyUpdate('description', e.target.value)}
                placeholder="Description de la publicite..."
                rows={5}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">CTA (Call to Action)</label>
              <input
                type="text"
                value={String(body.cta ?? '')}
                onChange={(e) => handleBodyUpdate('cta', e.target.value)}
                placeholder="ex: Telecharger maintenant"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">URL de destination</label>
              <input
                type="url"
                value={String(body.final_url ?? '')}
                onChange={(e) => handleBodyUpdate('final_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Objet de l&apos;email</label>
              <input
                type="text"
                value={String(body.subject ?? '')}
                onChange={(e) => handleBodyUpdate('subject', e.target.value)}
                placeholder="Objet de votre email..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Corps de l&apos;email</label>
              <textarea
                value={String(body.body ?? '')}
                onChange={(e) => handleBodyUpdate('body', e.target.value)}
                placeholder="Contenu de votre email..."
                rows={16}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        )

      case 'video_script':
        return (
          <div className="flex flex-col flex-1 gap-3">
            <textarea
              value={String(body.script ?? body.content ?? '')}
              onChange={(e) => handleBodyUpdate('script', e.target.value)}
              placeholder="Script de la video..."
              className="flex-1 min-h-96 w-full px-4 py-3 text-sm text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        )

      default:
        return (
          <div className="text-sm text-slate-400 text-center py-12">
            Type de contenu non supporte
          </div>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50">
      {/* Title */}
      <h2 className="text-base font-semibold text-slate-800 mb-4 truncate">{item.title}</h2>

      {/* Editor body */}
      <div className="flex-1">
        {renderEditor()}
      </div>

      {/* Save button */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {isDirty && (
          <span className="text-xs text-amber-600">Modifications non sauvegardees</span>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  )
}
