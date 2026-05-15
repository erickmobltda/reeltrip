import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Pencil, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { UrlInputForm } from '@/components/pois/UrlInputForm'
import { ProcessingState } from '@/components/pois/ProcessingState'
import { PoiSaveDialog } from '@/components/pois/PoiSaveDialog'
import { PoiCard } from '@/components/pois/PoiCard'
import { CategoryFilterBar } from '@/components/pois/CategoryFilterBar'
import { POI_CATEGORIES } from '@/lib/categories'
import { detectPlatform } from '@/lib/platform'
import { ApiError, postTravelNote } from '@/lib/api'
import { formatDateRange } from '@/lib/utils'
import { useTrip } from '@/hooks/useTrips'
import { createPoi, usePoisByTrip } from '@/hooks/usePois'
import type { CategoryId, Platform } from '@/types/poi'
import type { TravelNote } from '@/types/travel-note'

export function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trip, loading: tripLoading } = useTrip(id)
  const { pois, loading: poisLoading, refresh: refreshPois } = usePoisByTrip(id)
  const { toasts, toast, close } = useToast()

  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null)
  const [pendingNote, setPendingNote] = useState<TravelNote | null>(null)
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    const c: Partial<Record<CategoryId, number>> = {}
    for (const p of pois) {
      c[p.category] = (c[p.category] ?? 0) + 1
    }
    return c
  }, [pois])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pois.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false
      if (!q) return true
      const hay = [
        p.title,
        p.location_name,
        p.country,
        p.payload?.tldr,
        p.payload?.full_description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [pois, filter, search])

  function cancelProcessing() {
    abortRef.current?.abort()
    abortRef.current = null
    setProcessingStartedAt(null)
    setSubmittedUrl(null)
  }

  async function runApi(url: string) {
    if (!id) return
    const platform = detectPlatform(url)
    if (!platform) {
      toast('Unsupported URL', 'error')
      return
    }
    setSubmittedUrl(url)
    setPendingPlatform(platform)
    setProcessingStartedAt(Date.now())
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const note = await postTravelNote(url, ac.signal)
      if (ac.signal.aborted) return
      setPendingNote(note)
      setSaveOpen(true)
      setProcessingStartedAt(null)
    } catch (err) {
      if (ac.signal.aborted) return
      setProcessingStartedAt(null)
      setSubmittedUrl(null)
      if (err instanceof ApiError) {
        toast(`API error (${err.status}): ${err.message || 'request failed'}`, 'error')
      } else {
        toast(
          err instanceof Error ? err.message : 'Could not reach the API. Is it running?',
          'error'
        )
      }
    }
  }

  async function handleSave(category: CategoryId) {
    if (!id || !pendingNote || !submittedUrl || !pendingPlatform) return
    await createPoi({
      trip_id: id,
      source_url: submittedUrl,
      platform: pendingPlatform,
      category,
      payload: pendingNote,
    })
    setSaveOpen(false)
    setPendingNote(null)
    setPendingPlatform(null)
    setSubmittedUrl(null)
    toast('POI saved', 'success')
    await refreshPois()
  }

  function handleSaveDialogOpenChange(open: boolean) {
    setSaveOpen(open)
    if (!open) {
      setPendingNote(null)
      setPendingPlatform(null)
      setSubmittedUrl(null)
    }
  }

  if (tripLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-gray-500">Trip not found.</p>
        <Button className="mt-4" onClick={() => navigate('/trips')}>Back to trips</Button>
      </div>
    )
  }

  const dateRange = formatDateRange(trip.start_date, trip.end_date)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-3 -ml-2"
      >
        <Link to="/trips">
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>
      </Button>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{trip.name}</h1>
          {trip.description && (
            <p className="mt-1 text-sm text-gray-600">{trip.description}</p>
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
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/trips/${trip.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="mb-5">
        {processingStartedAt ? (
          <ProcessingState
            startedAt={processingStartedAt}
            onCancel={cancelProcessing}
            onRetry={() => submittedUrl && runApi(submittedUrl)}
          />
        ) : (
          <UrlInputForm onSubmit={runApi} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">POIs</h2>
          <span className="text-sm text-gray-400">{pois.length}</span>
          <div className="relative ml-auto w-44 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>

        <CategoryFilterBar
          selected={filter}
          onSelect={setFilter}
          counts={counts}
          total={pois.length}
        />

        {poisLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              {pois.length === 0
                ? 'No POIs yet. Paste a reel above to get started.'
                : filter !== 'all'
                ? `No "${POI_CATEGORIES.find((c) => c.id === filter)?.label}" POIs yet.`
                : 'No POIs match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((poi) => (
              <PoiCard key={poi.id} poi={poi} />
            ))}
          </div>
        )}
      </div>

      <PoiSaveDialog
        open={saveOpen}
        onOpenChange={handleSaveDialogOpenChange}
        note={pendingNote}
        platform={pendingPlatform}
        onSave={handleSave}
      />

      <ToastContainer toasts={toasts} onClose={close} />
    </div>
  )
}
