import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CategoryId, Platform, Poi } from '@/types/poi'
import type { TravelNote } from '@/types/travel-note'

export function usePoisByTrip(tripId: string | undefined) {
  const [pois, setPois] = useState<Poi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('pois')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setPois((data ?? []) as Poi[])
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
    const { data, error } = await supabase.from('pois').select('*').eq('id', id).single()
    if (error) setError(error.message)
    else setPoi(data as Poi)
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const p = input.payload
  const row = {
    user_id: user.id,
    trip_id: input.trip_id,
    source_url: input.source_url,
    platform: input.platform,
    title: p.title ?? null,
    country: p.location?.country ?? null,
    location_name: p.location?.name ?? null,
    category: input.category,
    payload: p,
  }
  const { data, error } = await supabase.from('pois').insert(row).select('*').single()
  if (error) throw error
  return data as Poi
}

export async function updatePoiCategory(id: string, category: CategoryId): Promise<Poi> {
  const { data, error } = await supabase
    .from('pois')
    .update({ category })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Poi
}

export async function deletePoi(id: string): Promise<void> {
  const { error } = await supabase.from('pois').delete().eq('id', id)
  if (error) throw error
}

export async function listPoisByCountry(country: string, excludeTripId?: string): Promise<Poi[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  let q = supabase
    .from('pois')
    .select('*')
    .eq('user_id', user.id)
    .eq('country', country)
    .order('created_at', { ascending: false })
  if (excludeTripId) q = q.neq('trip_id', excludeTripId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Poi[]
}

export async function duplicatePoisToTrip(poiIds: string[], tripId: string): Promise<number> {
  if (poiIds.length === 0) return 0
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const { data: sources, error: fetchErr } = await supabase
    .from('pois')
    .select('*')
    .in('id', poiIds)
  if (fetchErr) throw fetchErr
  const rows = (sources ?? []).map((p) => ({
    user_id: user.id,
    trip_id: tripId,
    source_url: p.source_url,
    platform: p.platform,
    title: p.title,
    country: p.country,
    location_name: p.location_name,
    category: p.category,
    payload: p.payload,
  }))
  if (rows.length === 0) return 0
  const { error } = await supabase.from('pois').insert(rows)
  if (error) throw error
  return rows.length
}
