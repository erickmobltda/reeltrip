import type { TravelNote } from '@/types/travel-note'
import { auth } from '@/lib/firebase'

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8010'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function postTravelNote(url: string, signal?: AbortSignal): Promise<TravelNote> {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new ApiError(401, 'Not signed in')
  const res = await fetch(`${API_BASE}/travel-note`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
    signal,
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail || `Request failed (${res.status})`)
  }
  return (await res.json()) as TravelNote
}
