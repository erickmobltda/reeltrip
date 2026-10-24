import { useCallback, useEffect, useState } from 'react'
import { addDoc, getDoc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore'
import { apiTokensCollection, currentUid, db, userCollection, userDoc } from '@/lib/firebase'
import type { Trip, TripInput } from '@/types/trip'

const newestFirst = (a: { created_at: string }, b: { created_at: string }) =>
  b.created_at.localeCompare(a.created_at)

function toRow(input: TripInput) {
  return {
    name: input.name,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    country: input.country?.trim() ? input.country.trim() : null,
  }
}

async function getTrip(id: string): Promise<Trip> {
  const snap = await getDoc(userDoc('trips', id))
  if (!snap.exists()) throw new Error('Trip not found')
  return { id: snap.id, ...snap.data() } as Trip
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const snap = await getDocs(userCollection('trips'))
      setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip).sort(newestFirst))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { trips, loading, error, refresh }
}

export function useTrip(id: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setTrip(await getTrip(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { trip, loading, error, refresh }
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const row = { ...toRow(input), user_id: currentUid(), created_at: new Date().toISOString() }
  const ref = await addDoc(userCollection('trips'), row)
  return { id: ref.id, ...row }
}

export async function updateTrip(id: string, input: TripInput): Promise<Trip> {
  await updateDoc(userDoc('trips', id), toRow(input))
  return getTrip(id)
}

// Firestore has no cascading deletes: remove the trip's POIs and API tokens with it.
export async function deleteTrip(id: string): Promise<void> {
  const [pois, tokens] = await Promise.all([
    getDocs(query(userCollection('pois'), where('trip_id', '==', id))),
    getDocs(query(apiTokensCollection(), where('uid', '==', currentUid()), where('trip_id', '==', id))),
  ])
  const batch = writeBatch(db)
  pois.docs.forEach((d) => batch.delete(d.ref))
  tokens.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(userDoc('trips', id))
  await batch.commit()
}
