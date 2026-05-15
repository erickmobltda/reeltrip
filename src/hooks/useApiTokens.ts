import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface ApiToken {
  id: string
  trip_id: string
  name: string | null
  created_at: string
  last_used_at: string | null
}

async function generateRawToken(): Promise<string> {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `rlt_${hex}`
}

async function hashToken(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function useApiTokens(tripId: string | undefined) {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    const { data } = await supabase
      .from('api_tokens')
      .select('id, trip_id, name, created_at, last_used_at')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    setTokens((data ?? []) as ApiToken[])
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createToken(name: string): Promise<string> {
    if (!tripId) throw new Error('No trip')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const raw = await generateRawToken()
    const hash = await hashToken(raw)
    const { error } = await supabase.from('api_tokens').insert({
      user_id: user.id,
      trip_id: tripId,
      token_hash: hash,
      name: name.trim() || null,
    })
    if (error) throw error
    await refresh()
    return raw
  }

  async function revokeToken(tokenId: string): Promise<void> {
    const { error } = await supabase.from('api_tokens').delete().eq('id', tokenId)
    if (error) throw error
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
  }

  return { tokens, loading, refresh, createToken, revokeToken }
}
