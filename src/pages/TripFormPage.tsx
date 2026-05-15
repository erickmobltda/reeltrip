import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { TripForm } from '@/components/trips/TripForm'
import { ImportPoisDialog } from '@/components/trips/ImportPoisDialog'
import { ToastContainer, useToast } from '@/components/ui/toast'
import {
  createTrip,
  deleteTrip,
  updateTrip,
  useTrip,
} from '@/hooks/useTrips'
import { listPoisByCountry } from '@/hooks/usePois'
import type { Poi } from '@/types/poi'
import type { TripInput } from '@/types/trip'

export function TripFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { trip, loading } = useTrip(id)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toasts, toast, close } = useToast()

  const [importOpen, setImportOpen] = useState(false)
  const [candidates, setCandidates] = useState<Poi[]>([])
  const [newTripId, setNewTripId] = useState<string | null>(null)
  const [newTripCountry, setNewTripCountry] = useState<string>('')

  useEffect(() => {
    if (isEdit && !loading && !trip) {
      navigate('/trips', { replace: true })
    }
  }, [isEdit, loading, trip, navigate])

  async function handleSubmit(values: TripInput) {
    setBusy(true)
    try {
      if (isEdit && id) {
        await updateTrip(id, values)
        navigate(`/trips/${id}`)
      } else {
        const created = await createTrip(values)
        if (created.country) {
          try {
            const found = await listPoisByCountry(created.country, created.id)
            if (found.length > 0) {
              setCandidates(found)
              setNewTripId(created.id)
              setNewTripCountry(created.country)
              setImportOpen(true)
              return
            }
          } catch {
            /* non-fatal */
          }
        }
        navigate(`/trips/${created.id}`)
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!id || !trip) return
    if (!confirm(`Delete "${trip.name}"? This also deletes all its POIs.`)) return
    setDeleting(true)
    try {
      await deleteTrip(id)
      navigate('/trips', { replace: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete trip', 'error')
      setDeleting(false)
    }
  }

  if (isEdit && loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-3 -ml-2"
        onClick={() => navigate(isEdit && id ? `/trips/${id}` : '/trips')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit trip' : 'New trip'}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {isEdit ? 'Update your trip details.' : 'Give your trip a name to get started.'}
      </p>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <TripForm
          initial={trip}
          submitLabel={isEdit ? 'Save changes' : 'Create trip'}
          onSubmit={handleSubmit}
          busy={busy}
          onCancel={() => navigate(isEdit && id ? `/trips/${id}` : '/trips')}
        />
      </div>

      {isEdit && trip && (
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete trip'}
          </Button>
        </div>
      )}

      {newTripId && (
        <ImportPoisDialog
          open={importOpen}
          onOpenChange={(open) => {
            setImportOpen(open)
            if (!open && newTripId) navigate(`/trips/${newTripId}`)
          }}
          candidates={candidates}
          targetTripId={newTripId}
          country={newTripCountry}
          onImported={(count) => {
            toast(`Imported ${count} POI${count === 1 ? '' : 's'}`, 'success')
          }}
        />
      )}

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}
