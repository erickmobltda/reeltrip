export interface TravelNoteLocation {
  name?: string
  country?: string
  region?: string
}

export interface TravelNotePracticalInfo {
  best_time_to_visit?: string
  estimated_cost?: string
  how_to_get_there?: string
  accommodation_tips?: string
  food_tips?: string
}

export interface TravelNoteLink {
  label: string
  url: string
}

export interface TravelNoteSource {
  original_url: string
  title?: string
  platform?: string
}

export interface TravelNote {
  title?: string
  tldr?: string
  location?: TravelNoteLocation
  full_description?: string
  highlights?: string[]
  practical_info?: TravelNotePracticalInfo
  useful_links?: TravelNoteLink[]
  source?: TravelNoteSource
}
