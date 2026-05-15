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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { POI_CATEGORIES, getCategory } from '@/lib/categories'
import { PlatformBadge } from './PlatformBadge'
import { CategoryBadge } from './CategoryBadge'
import { HighlightsList } from './HighlightsList'
import type { CategoryId, Platform } from '@/types/poi'
import type { TravelNote } from '@/types/travel-note'

interface PoiSaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: TravelNote | null
  platform: Platform | null
  onSave: (category: CategoryId) => Promise<void>
}

export function PoiSaveDialog({ open, onOpenChange, note, platform, onSave }: PoiSaveDialogProps) {
  const [category, setCategory] = useState<CategoryId>('other')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setBusy(true)
    setError(null)
    try {
      await onSave(category)
      setCategory('other')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save POI')
    } finally {
      setBusy(false)
    }
  }

  if (!note) return null
  const placeBits = [note.location?.name, note.location?.country].filter(Boolean).join(', ')

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to your trip</DialogTitle>
          <DialogDescription>
            Pick a category so you can find this POI later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {platform && <PlatformBadge platform={platform} />}
              <CategoryBadge category={category} />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900">
              {note.title ?? 'Untitled travel note'}
            </h3>
            {placeBits && <p className="mt-0.5 text-xs text-gray-500">{placeBits}</p>}
            {note.tldr && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{note.tldr}</p>}
            {note.highlights && note.highlights.length > 0 && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <HighlightsList items={note.highlights.slice(0, 3)} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="poi-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
              <SelectTrigger id="poi-category">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {POI_CATEGORIES.map((c) => {
                  const Icon = c.icon
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-gray-500" />
                        {c.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              You can change this later. Selected: {getCategory(category).label}.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save POI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
