import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Trip, TripInput } from '@/types/trip'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTrips((data ?? []) as Trip[])
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
    const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
    if (error) setError(error.message)
    else setTrip(data as Trip)
    setLoading(false)
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { trip, loading, error, refresh }
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const row = {
    user_id: user.id,
    name: input.name,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    country: input.country?.trim() ? input.country.trim() : null,
  }
  const { data, error } = await supabase.from('trips').insert(row).select('*').single()
  if (error) throw error
  return data as Trip
}

export async function updateTrip(id: string, input: TripInput): Promise<Trip> {
  const row = {
    name: input.name,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    country: input.country?.trim() ? input.country.trim() : null,
  }
  const { data, error } = await supabase.from('trips').update(row).eq('id', id).select('*').single()
  if (error) throw error
  return data as Trip
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id)
  if (error) throw error
}
