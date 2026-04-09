'use client'

import { PlatformConnection, PLATFORM_LABELS, Platform } from '@/lib/marketing/types'

interface PlatformCardProps {
  platform: PlatformConnection
  onToggle: (platform: Platform) => void
  onConnect: (platform: Platform) => void
  onDisconnect: (platform: Platform) => void
}

const PLATFORM_EMOJI: Record<string, string> = {
  instagram:              '📸',
  tiktok:                 '🎵',
  youtube:                '▶️',
  linkedin:               '💼',
  facebook:               '👤',
  google_ads:             '📢',
  google_search_console:  '🔍',
  google_analytics:       '📊',
  google_merchant_center: '🛍️',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PlatformCard({ platform, onToggle, onConnect, onDisconnect }: PlatformCardProps) {
  const isEnabled = platform.enabled
  const emoji = PLATFORM_EMOJI[platform.platform] ?? '🔌'
  const label = PLATFORM_LABELS[platform.platform]

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
        isEnabled
          ? 'bg-white border-indigo-200 shadow-sm'
          : 'bg-slate-50 border-slate-200 opacity-70'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{label}</p>
          </div>
        </div>
        {/* Toggle switch */}
        <button
          onClick={() => onToggle(platform.platform)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
          }`}
          role="switch"
          aria-checked={isEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${platform.connected ? 'bg-green-500' : 'bg-slate-300'}`}
        />
        <div className="text-xs">
          {platform.connected ? (
            <span className="text-green-700 font-medium">
              Connecté
              {platform.account_name && (
                <span className="text-slate-500 font-normal"> — {platform.account_name}</span>
              )}
            </span>
          ) : (
            <span className="text-slate-500">Non connecté</span>
          )}
        </div>
      </div>

      {/* Last sync */}
      {platform.connected && platform.last_sync_at && (
        <p className="text-xs text-slate-400">
          Dernière sync : {formatDate(platform.last_sync_at)}
        </p>
      )}

      {/* Action button */}
      <div className="mt-auto">
        {platform.connected ? (
          <button
            onClick={() => onDisconnect(platform.platform)}
            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
          >
            Déconnecter
          </button>
        ) : (
          <button
            onClick={() => onConnect(platform.platform)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            Connecter
          </button>
        )}
      </div>
    </div>
  )
}
