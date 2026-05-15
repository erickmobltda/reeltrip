import { useState } from 'react'
import { Copy, ExternalLink, Check, MapPin, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PlatformBadge } from './PlatformBadge'
import { CategoryBadge } from './CategoryBadge'
import { HighlightsList } from './HighlightsList'
import { PracticalInfo } from './PracticalInfo'
import { UsefulLinks } from './UsefulLinks'
import { POI_CATEGORIES } from '@/lib/categories'
import { deletePoi, updatePoiCategory } from '@/hooks/usePois'
import type { CategoryId, Poi } from '@/types/poi'

interface PoiViewProps {
  poi: Poi
  onCategoryChanged?: (poi: Poi) => void
  onDeleted?: () => void
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void
}

export function PoiView({ poi, onCategoryChanged, onDeleted, onToast }: PoiViewProps) {
  const p = poi.payload
  const [copied, setCopied] = useState(false)
  const [category, setCategory] = useState<CategoryId>(poi.category)
  const [savingCat, setSavingCat] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const placeBits = [poi.location_name, poi.country].filter(Boolean).join(', ')

  async function copyTldr() {
    if (!p.tldr) return
    try {
      await navigator.clipboard.writeText(p.tldr)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      onToast?.('TLDR copied', 'success')
    } catch {
      onToast?.('Copy failed', 'error')
    }
  }

  async function handleCategoryChange(next: CategoryId) {
    if (next === category) return
    setSavingCat(true)
    const prev = category
    setCategory(next)
    try {
      const updated = await updatePoiCategory(poi.id, next)
      onCategoryChanged?.(updated)
      onToast?.('Category updated', 'success')
    } catch (err) {
      setCategory(prev)
      onToast?.(err instanceof Error ? err.message : 'Could not update', 'error')
    } finally {
      setSavingCat(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this POI?')) return
    setDeleting(true)
    try {
      await deletePoi(poi.id)
      onDeleted?.()
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : 'Could not delete', 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={poi.platform} />
          <CategoryBadge category={category} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {p.title ?? poi.title ?? 'Travel note'}
        </h1>
        {placeBits && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-primary-600" />
            <span className="font-medium">{poi.location_name ?? p.location?.name}</span>
            {poi.country && <span className="text-gray-400">·</span>}
            {poi.country && <span>{poi.country}</span>}
            {p.location?.region && (
              <>
                <span className="text-gray-400">·</span>
                <span>{p.location.region}</span>
              </>
            )}
          </p>
        )}
      </div>

      {p.tldr && (
        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">TLDR</p>
              <p className="mt-1 text-sm text-gray-700">{p.tldr}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={copyTldr} aria-label="Copy TLDR">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {p.full_description && (
        <div>
          <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {p.full_description}
          </p>
        </div>
      )}

      {p.highlights && p.highlights.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Highlights
          </h2>
          <HighlightsList items={p.highlights} />
        </div>
      )}

      <PracticalInfo info={p.practical_info} />

      {p.useful_links && p.useful_links.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Useful links
          </h2>
          <UsefulLinks links={p.useful_links} />
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="poi-cat-edit">Category</Label>
          <Select
            value={category}
            onValueChange={(v) => handleCategoryChange(v as CategoryId)}
            disabled={savingCat}
          >
            <SelectTrigger id="poi-cat-edit">
              <SelectValue />
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
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="outline" size="sm">
            <a href={poi.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open source
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete POI'}
          </Button>
        </div>
      </div>
    </div>
  )
}
