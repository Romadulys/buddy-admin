'use client'

import { useState, useEffect } from 'react'
import GuidelineSection from './GuidelineSection'
import ColorPalette from './ColorPalette'
import VocabularyTable from './VocabularyTable'

interface BrandGuidelines {
  identity?: Record<string, unknown>
  colors?: { primary?: Array<{ name: string; hex: string; usage: string }>; neutral?: Array<{ name: string; hex: string; usage: string }> }
  typography?: Record<string, { family?: string; weight?: string; usage?: string }>
  tone?: { do?: string[]; avoid?: string[]; personality?: string }
  vocabulary?: { prefer: Array<{ use: string; instead_of: string; reason: string }>; always_mention: string[]; never_use: string[] }
  logos?: Record<string, { name?: string; usage?: string }>
  rules?: { general?: string[]; content?: string[] }
  [key: string]: Record<string, unknown> | undefined
}

const SECTION_META: Record<string, { title: string; icon: string }> = {
  identity: { title: 'Identite de marque', icon: '🏷️' },
  colors: { title: 'Couleurs', icon: '🎨' },
  typography: { title: 'Typographie', icon: '✍️' },
  tone: { title: 'Ton de voix', icon: '💬' },
  vocabulary: { title: 'Vocabulaire', icon: '📖' },
  logos: { title: 'Logos', icon: '🖼️' },
  rules: { title: 'Regles editoriales', icon: '📋' },
}

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<BrandGuidelines | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/marketing/brand/guidelines')
      .then((r) => r.json())
      .then((data) => setGuidelines(data.guidelines ?? data ?? {}))
      .catch(() => setGuidelines({}))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (section: string, content: Record<string, unknown>) => {
    try {
      await fetch('/api/marketing/brand/guidelines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content }),
      })
      setGuidelines((prev) => prev ? { ...prev, [section]: content } : { [section]: content })
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 anim-section">
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      </div>
    )
  }

  const data = guidelines ?? {}

  return (
    <div className="p-6 anim-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">🎨 Brand Guidelines — Buddy</h1>
        <p className="text-slate-500 text-sm mt-1">Charte graphique et editoriale officielle</p>
      </div>

      {/* Identity */}
      <GuidelineSection
        section="identity"
        title={SECTION_META.identity.title}
        icon={SECTION_META.identity.icon}
        content={(data.identity as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(data.identity ?? {}).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{key}</p>
              <p className="text-sm text-slate-800">{String(value)}</p>
            </div>
          ))}
        </div>
      </GuidelineSection>

      {/* Colors */}
      <GuidelineSection
        section="colors"
        title={SECTION_META.colors.title}
        icon={SECTION_META.colors.icon}
        content={(data.colors as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="space-y-6">
          {data.colors?.primary && data.colors.primary.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-3">Couleurs primaires</p>
              <ColorPalette colors={data.colors.primary} />
            </div>
          )}
          {data.colors?.neutral && data.colors.neutral.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-3">Couleurs neutres</p>
              <ColorPalette colors={data.colors.neutral} />
            </div>
          )}
        </div>
      </GuidelineSection>

      {/* Typography */}
      <GuidelineSection
        section="typography"
        title={SECTION_META.typography.title}
        icon={SECTION_META.typography.icon}
        content={(data.typography as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(data.typography ?? {}).map(([key, val]) => {
            const typo = val as { family?: string; weight?: string; usage?: string }
            return (
              <div key={key} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{key}</p>
                <p className="font-semibold text-slate-900 text-sm">{typo.family}</p>
                <p className="text-xs text-slate-500">{typo.weight}</p>
                <p className="text-xs text-slate-400 mt-1">{typo.usage}</p>
              </div>
            )
          })}
        </div>
      </GuidelineSection>

      {/* Tone */}
      <GuidelineSection
        section="tone"
        title={SECTION_META.tone.title}
        icon={SECTION_META.tone.icon}
        content={(data.tone as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">A faire ✅</p>
              <div className="flex flex-wrap gap-2">
                {(data.tone?.do ?? []).map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">A eviter ❌</p>
              <div className="flex flex-wrap gap-2">
                {(data.tone?.avoid ?? []).map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {data.tone?.personality && (
            <p className="text-sm text-slate-600 italic border-l-4 border-indigo-300 pl-3">
              {data.tone.personality}
            </p>
          )}
        </div>
      </GuidelineSection>

      {/* Vocabulary */}
      {data.vocabulary && (
        <GuidelineSection
          section="vocabulary"
          title={SECTION_META.vocabulary.title}
          icon={SECTION_META.vocabulary.icon}
          content={(data.vocabulary as unknown as Record<string, unknown>)}
          onSave={handleSave}
        >
          <VocabularyTable vocabulary={data.vocabulary} />
        </GuidelineSection>
      )}

      {/* Logos */}
      <GuidelineSection
        section="logos"
        title={SECTION_META.logos.title}
        icon={SECTION_META.logos.icon}
        content={(data.logos as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.logos ?? {}).map(([key, val]) => {
            const logo = val as { name?: string; usage?: string }
            return (
              <div key={key} className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-800 text-sm">{logo.name ?? key}</p>
                <p className="text-xs text-slate-500 mt-1">{logo.usage}</p>
              </div>
            )
          })}
        </div>
      </GuidelineSection>

      {/* Rules */}
      <GuidelineSection
        section="rules"
        title={SECTION_META.rules.title}
        icon={SECTION_META.rules.icon}
        content={(data.rules as Record<string, unknown>) ?? {}}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.rules?.general && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Regles generales</p>
              <ul className="space-y-1">
                {data.rules.general.map((rule, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-slate-400">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.rules?.content && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Regles de contenu</p>
              <ul className="space-y-1">
                {data.rules.content.map((rule, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-slate-400">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </GuidelineSection>
    </div>
  )
}
