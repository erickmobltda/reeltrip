import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { PoiView } from '@/components/pois/PoiView'
import { usePoi } from '@/hooks/usePois'

export function PoiDetailPage() {
  const { tripId, poiId } = useParams()
  const navigate = useNavigate()
  const { poi, loading } = usePoi(poiId)
  const { toasts, toast, close } = useToast()

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!poi) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-gray-500">POI not found.</p>
        <Button className="mt-4" asChild>
          <Link to={tripId ? `/trips/${tripId}` : '/trips'}>Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to={`/trips/${poi.trip_id}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to trip
        </Link>
      </Button>

      <PoiView
        poi={poi}
        onDeleted={() => navigate(`/trips/${poi.trip_id}`, { replace: true })}
        onToast={toast}
      />

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}
