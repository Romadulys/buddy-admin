import { supabase } from '@/lib/supabase'
import type { Platform, PlatformConnection } from './types'

// ------------------------------------------------------------
// listPlatforms
// ------------------------------------------------------------

export async function listPlatforms(): Promise<PlatformConnection[]> {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .order('platform', { ascending: true })

  if (error) throw error
  return data as PlatformConnection[]
}

// ------------------------------------------------------------
// getPlatform
// ------------------------------------------------------------

export async function getPlatform(platform: Platform): Promise<PlatformConnection> {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('platform', platform)
    .single()

  if (error) throw error
  return data as PlatformConnection
}

// ------------------------------------------------------------
// togglePlatform
// ------------------------------------------------------------

export async function togglePlatform(
  platform: Platform,
  enabled: boolean,
): Promise<PlatformConnection> {
  const { data, error } = await supabase
    .from('platform_connections')
    .update({ enabled })
    .eq('platform', platform)
    .select()
    .single()

  if (error) throw error
  return data as PlatformConnection
}

// ------------------------------------------------------------
// connectPlatform
// ------------------------------------------------------------

export interface PlatformCredentials {
  access_token: string
  refresh_token?: string
  account_id?: string
  account_name?: string
  token_expires_at?: string
  config?: Record<string, unknown>
}

export async function connectPlatform(
  platform: Platform,
  credentials: PlatformCredentials,
): Promise<PlatformConnection> {
  const now = new Date().toISOString()

  const payload: Partial<PlatformConnection> = {
    connected:        true,
    connected_at:     now,
    access_token:     credentials.access_token,
    refresh_token:    credentials.refresh_token ?? null,
    account_id:       credentials.account_id ?? null,
    account_name:     credentials.account_name ?? null,
    token_expires_at: credentials.token_expires_at ?? null,
  }

  if (credentials.config) {
    payload.config = credentials.config
  }

  const { data, error } = await supabase
    .from('platform_connections')
    .update(payload)
    .eq('platform', platform)
    .select()
    .single()

  if (error) throw error
  return data as PlatformConnection
}

// ------------------------------------------------------------
// disconnectPlatform
// ------------------------------------------------------------

export async function disconnectPlatform(platform: Platform): Promise<PlatformConnection> {
  const payload: Partial<PlatformConnection> = {
    connected:        false,
    access_token:     null,
    refresh_token:    null,
    account_id:       null,
    account_name:     null,
    token_expires_at: null,
    connected_at:     null,
  }

  const { data, error } = await supabase
    .from('platform_connections')
    .update(payload)
    .eq('platform', platform)
    .select()
    .single()

  if (error) throw error
  return data as PlatformConnection
}

// ------------------------------------------------------------
// getEnabledPlatforms
// ------------------------------------------------------------

export async function getEnabledPlatforms(): Promise<PlatformConnection[]> {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('enabled', true)
    .order('platform', { ascending: true })

  if (error) throw error
  return data as PlatformConnection[]
}
