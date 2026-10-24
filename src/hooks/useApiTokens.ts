import { useCallback, useEffect, useState } from 'react'
import { deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { apiTokensCollection, currentUid } from '@/lib/firebase'

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

// Each token is stored under its SHA-256 hash, so erickmob-api can look it up
// directly; the raw token is shown once and never stored.
export function useApiTokens(tripId: string | undefined) {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    const snap = await getDocs(
      query(apiTokensCollection(), where('uid', '==', currentUid()), where('trip_id', '==', tripId)),
    )
    setTokens(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ApiToken)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    )
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createToken(name: string): Promise<string> {
    if (!tripId) throw new Error('No trip')
    const raw = await generateRawToken()
    const hash = await hashToken(raw)
    await setDoc(doc(apiTokensCollection(), hash), {
      uid: currentUid(),
      trip_id: tripId,
      name: name.trim() || null,
      created_at: new Date().toISOString(),
      last_used_at: null,
    })
    await refresh()
    return raw
  }

  async function revokeToken(tokenId: string): Promise<void> {
    await deleteDoc(doc(apiTokensCollection(), tokenId))
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
  }

  return { tokens, loading, refresh, createToken, revokeToken }
}
