import { Link } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PlatformBadge } from './PlatformBadge'
import { CategoryBadge } from './CategoryBadge'
import type { Poi } from '@/types/poi'

interface PoiCardProps {
  poi: Poi
}

export function PoiCard({ poi }: PoiCardProps) {
  const tldr = poi.payload?.tldr
  const placeBits = [poi.location_name, poi.country].filter(Boolean).join(', ')
  return (
    <Link to={`/trips/${poi.trip_id}/pois/${poi.id}`} className="block group">
      <Card className="p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={poi.category} />
              <PlatformBadge platform={poi.platform} />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900 line-clamp-2">
              {poi.title ?? poi.location_name ?? 'Travel note'}
            </h3>
            {placeBits && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {placeBits}
              </p>
            )}
            {tldr && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{tldr}</p>}
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-500" />
        </div>
      </Card>
    </Link>
  )
}
