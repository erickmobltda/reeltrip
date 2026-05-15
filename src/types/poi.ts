import type { TravelNote } from './travel-note'

export type CategoryId =
  | 'eat'
  | 'sleep'
  | 'see'
  | 'do'
  | 'save-money'
  | 'transport'
  | 'shop'
  | 'other'

export type Platform = 'instagram' | 'youtube' | 'tiktok'

export interface Poi {
  id: string
  user_id: string
  trip_id: string
  created_at: string
  source_url: string
  platform: Platform
  title: string | null
  country: string | null
  location_name: string | null
  category: CategoryId
  payload: TravelNote
}
