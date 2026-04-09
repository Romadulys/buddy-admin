'use client'

import { useState } from 'react'

interface Color {
  name: string
  hex: string
  usage: string
}

interface ColorPaletteProps {
  colors: Color[]
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {colors.map((color) => (
        <div
          key={color.hex}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div
            className="h-16 rounded-t-xl"
            style={{ backgroundColor: color.hex }}
          />
          <div className="p-3 space-y-1">
            <p className="font-semibold text-slate-900 text-sm">{color.name}</p>
            <p className="font-mono text-xs text-slate-500">{color.hex}</p>
            <p className="text-xs text-slate-400">{color.usage}</p>
            <button
              onClick={() => handleCopy(color.hex)}
              className="mt-2 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {copied === color.hex ? '✓ Copie' : 'Copier'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
