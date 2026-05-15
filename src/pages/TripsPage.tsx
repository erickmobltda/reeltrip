import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTrips } from '@/hooks/useTrips'
import { TripCard } from '@/components/trips/TripCard'
import { EmptyTripsState } from '@/components/trips/EmptyTripsState'

export function TripsPage() {
  const { trips, loading, error } = useTrips()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your trips</h1>
          <p className="text-sm text-gray-500">Organize your reels by trip and category.</p>
        </div>
        <Button asChild>
          <Link to="/trips/new">
            <Plus className="h-4 w-4" />
            New trip
          </Link>
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : trips.length === 0 ? (
        <EmptyTripsState />
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
