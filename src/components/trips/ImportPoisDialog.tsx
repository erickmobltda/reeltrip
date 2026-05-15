import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCategory } from '@/lib/categories'
import { duplicatePoisToTrip } from '@/hooks/usePois'
import type { Poi } from '@/types/poi'

interface ImportPoisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidates: Poi[]
  targetTripId: string
  country: string
  onImported: (count: number) => void
}

export function ImportPoisDialog({
  open,
  onOpenChange,
  candidates,
  targetTripId,
  country,
  onImported,
}: ImportPoisDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === candidates.length) setSelected(new Set())
    else setSelected(new Set(candidates.map((p) => p.id)))
  }

  async function handleImport() {
    if (selected.size === 0) {
      onOpenChange(false)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const count = await duplicatePoisToTrip(Array.from(selected), targetTripId)
      onImported(count)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import POIs')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import POIs from past trips</DialogTitle>
          <DialogDescription>
            We found {candidates.length} POI{candidates.length === 1 ? '' : 's'} you saved in{' '}
            <span className="font-medium text-gray-700">{country}</span>. Pick any you want to add to this trip.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-2 max-h-72 overflow-y-auto">
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              {selected.size === candidates.length ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {candidates.map((poi) => {
              const cat = getCategory(poi.category)
              const Icon = cat.icon
              const checked = selected.has(poi.id)
              return (
                <li key={poi.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-2 py-2.5 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(poi.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cat.badgeClass}`}
                        >
                          <Icon className="h-3 w-3" />
                          {cat.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {poi.title ?? poi.location_name ?? 'Untitled'}
                        </span>
                      </div>
                      {poi.location_name && (
                        <p className="mt-0.5 text-xs text-gray-500 truncate">{poi.location_name}</p>
                      )}
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Skip
          </Button>
          <Button onClick={handleImport} disabled={busy || selected.size === 0}>
            {busy ? 'Importing…' : `Import ${selected.size || ''}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
