import { Link } from 'react-router-dom'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatDateRange } from '@/lib/utils'
import type { Trip } from '@/types/trip'

interface TripCardProps {
  trip: Trip
  poiCount?: number
}

export function TripCard({ trip, poiCount }: TripCardProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  return (
    <Link to={`/trips/${trip.id}`} className="block group">
      <Card className="p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
            {trip.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{trip.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {trip.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.country}
                </span>
              )}
              {dateRange && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateRange}
                </span>
              )}
              {typeof poiCount === 'number' && (
                <span className="inline-flex items-center gap-1">
                  {poiCount} {poiCount === 1 ? 'POI' : 'POIs'}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-500" />
        </div>
      </Card>
    </Link>
  )
}
