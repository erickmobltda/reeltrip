import { useCallback, useEffect, useState } from 'react'
import { addDoc, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore'
import { currentUid, db, userCollection, userDoc } from '@/lib/firebase'
import type { CategoryId, Platform, Poi } from '@/types/poi'
import type { TravelNote } from '@/types/travel-note'

const newestFirst = (a: Poi, b: Poi) => b.created_at.localeCompare(a.created_at)

async function getPoi(id: string): Promise<Poi> {
  const snap = await getDoc(userDoc('pois', id))
  if (!snap.exists()) throw new Error('POI not found')
  return { id: snap.id, ...snap.data() } as Poi
}

export function usePoisByTrip(tripId: string | undefined) {
  const [pois, setPois] = useState<Poi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    setError(null)
    try {
      const snap = await getDocs(query(userCollection('pois'), where('trip_id', '==', tripId)))
      setPois(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Poi).sort(newestFirst))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load POIs')
    }
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { pois, loading, error, refresh, setPois }
}

export function usePoi(id: string | undefined) {
  const [poi, setPoi] = useState<Poi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setPoi(await getPoi(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load POI')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { poi, loading, error, refresh }
}

export interface CreatePoiInput {
  trip_id: string
  source_url: string
  platform: Platform
  category: CategoryId
  payload: TravelNote
}

export async function createPoi(input: CreatePoiInput): Promise<Poi> {
  const p = input.payload
  const row = {
    user_id: currentUid(),
    trip_id: input.trip_id,
    created_at: new Date().toISOString(),
    source_url: input.source_url,
    platform: input.platform,
    title: p.title ?? null,
    country: p.location?.country ?? null,
    location_name: p.location?.name ?? null,
    category: input.category,
    payload: p,
  }
  const ref = await addDoc(userCollection('pois'), row)
  return { id: ref.id, ...row }
}

export async function updatePoiCategory(id: string, category: CategoryId): Promise<Poi> {
  await updateDoc(userDoc('pois', id), { category })
  return getPoi(id)
}

export async function deletePoi(id: string): Promise<void> {
  await deleteDoc(userDoc('pois', id))
}

export async function listPoisByCountry(country: string, excludeTripId?: string): Promise<Poi[]> {
  const snap = await getDocs(query(userCollection('pois'), where('country', '==', country)))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Poi)
    .filter((p) => p.trip_id !== excludeTripId)
    .sort(newestFirst)
}

export async function duplicatePoisToTrip(poiIds: string[], tripId: string): Promise<number> {
  if (poiIds.length === 0) return 0
  const sources = await Promise.all(poiIds.map(getPoi))
  const batch = writeBatch(db)
  const created_at = new Date().toISOString()
  for (const p of sources) {
    batch.set(doc(userCollection('pois')), {
      user_id: currentUid(),
      trip_id: tripId,
      created_at,
      source_url: p.source_url,
      platform: p.platform,
      title: p.title,
      country: p.country,
      location_name: p.location_name,
      category: p.category,
      payload: p.payload,
    })
  }
  await batch.commit()
  return sources.length
}
