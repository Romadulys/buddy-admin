'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlatformConnection, Platform } from '@/lib/marketing/types'
import PlatformCard from './PlatformCard'

const SOCIAL_PLATFORMS: Platform[] = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook']
const GOOGLE_PLATFORMS: Platform[] = [
  'google_ads',
  'google_search_console',
  'google_analytics',
  'google_merchant_center',
]

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/platforms')
      if (!res.ok) throw new Error('Fetch error')
      const data = await res.json()
      setPlatforms(data.platforms ?? data ?? [])
    } catch (err) {
      console.error('Failed to fetch platforms:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlatforms()
  }, [fetchPlatforms])

  const patchPlatform = async (platform: Platform, body: Record<string, unknown>) => {
    try {
      await fetch(`/api/marketing/platforms`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, ...body }),
      })
      await fetchPlatforms()
    } catch (err) {
      console.error('Platform update error:', err)
    }
  }

  const handleToggle = (platform: Platform) => {
    patchPlatform(platform, { action: 'toggle' })
  }

  const handleConnect = (platform: Platform) => {
    // Placeholder credentials — real OAuth flow would be implemented here
    patchPlatform(platform, {
      action: 'connect',
      credentials: { placeholder: true },
    })
  }

  const handleDisconnect = (platform: Platform) => {
    patchPlatform(platform, { action: 'disconnect' })
  }

  const getPlatform = (p: Platform) =>
    platforms.find((pc) => pc.platform === p) ?? {
      id: p,
      platform: p,
      enabled: false,
      connected: false,
      access_token: null,
      refresh_token: null,
      account_id: null,
      account_name: null,
      token_expires_at: null,
      connected_at: null,
      last_sync_at: null,
      config: {},
    } as PlatformConnection

  const renderGrid = (platformList: Platform[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {platformList.map((p) => (
        <PlatformCard
          key={p}
          platform={getPlatform(p)}
          onToggle={handleToggle}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      ))}
    </div>
  )

  return (
    <div className="p-6 anim-section">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🔌 Connexions Plateformes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les connexions aux réseaux sociaux et aux outils Google
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div>
      ) : (
        <div className="space-y-8">
          {/* Social networks */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Réseaux sociaux</h2>
            {renderGrid(SOCIAL_PLATFORMS)}
          </section>

          {/* Google */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Google</h2>
            {renderGrid(GOOGLE_PLATFORMS)}
          </section>
        </div>
      )}
    </div>
  )
}
