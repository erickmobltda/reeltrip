export interface Trip {
  id: string
  user_id: string
  created_at: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  country: string | null
}

export interface TripInput {
  name: string
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  country?: string | null
}
