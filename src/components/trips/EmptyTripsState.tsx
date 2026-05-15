import { Link } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyTripsState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
        <MapPin className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">No trips yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Create your first trip to start collecting reels into a guide.
      </p>
      <Button asChild className="mt-5">
        <Link to="/trips/new">
          <Plus className="h-4 w-4" />
          Create a trip
        </Link>
      </Button>
    </div>
  )
}
