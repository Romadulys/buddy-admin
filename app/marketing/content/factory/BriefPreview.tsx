'use client'

type ContentType = 'article' | 'social_post' | 'video_brief' | 'image_brief' | 'video_script' | 'ad_creative' | 'email'

interface Props {
  type: ContentType
  body: Record<string, unknown>
}

const VIDEO_BRIEF_SECTIONS: Array<{ key: string; label: string }> = [
  { key: 'concept', label: 'Concept' },
  { key: 'script', label: 'Script' },
  { key: 'shot_list', label: 'Shot List' },
  { key: 'duration_format', label: 'Duree / Format' },
  { key: 'sound', label: 'Son' },
  { key: 'subtitles', label: 'Sous-titres' },
  { key: 'platform_variants', label: 'Variantes plateforme' },
  { key: 'text_overlay', label: 'Texte en surimpression' },
]

const IMAGE_BRIEF_SECTIONS: Array<{ key: string; label: string }> = [
  { key: 'concept', label: 'Concept' },
  { key: 'template', label: 'Template' },
  { key: 'text_on_visual', label: 'Texte sur visuel' },
  { key: 'product_photo', label: 'Photo produit' },
  { key: 'colors_ambiance', label: 'Couleurs / Ambiance' },
  { key: 'format_dimensions', label: 'Format / Dimensions' },
  { key: 'ai_prompt', label: 'Prompt IA' },
]

function renderValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2)
  return String(value)
}

function BriefSection({ label, value }: { label: string; value: unknown }) {
  const text = renderValue(value)
  if (!text || text === 'null' || text === 'undefined') return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</h3>
      {typeof value === 'object' && value !== null && !Array.isArray(value) ? (
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 rounded p-2 overflow-x-auto">
          {text}
        </pre>
      ) : (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{text}</p>
      )}
    </div>
  )
}

export default function BriefPreview({ type, body }: Props) {
  const sections = type === 'video_brief' ? VIDEO_BRIEF_SECTIONS : IMAGE_BRIEF_SECTIONS

  // Show defined sections first, then any extra keys in the body
  const definedKeys = new Set(sections.map((s) => s.key))
  const extraKeys = Object.keys(body).filter((k) => !definedKeys.has(k))

  return (
    <div className="space-y-3">
      {sections.map(({ key, label }) =>
        body[key] !== undefined && body[key] !== null && body[key] !== '' ? (
          <BriefSection key={key} label={label} value={body[key]} />
        ) : null
      )}
      {extraKeys.map((key) => (
        <BriefSection key={key} label={key} value={body[key]} />
      ))}
    </div>
  )
}
