import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { TripInput, Trip } from '@/types/trip'

interface TripFormProps {
  initial?: Trip | null
  submitLabel: string
  onSubmit: (values: TripInput) => Promise<void>
  onCancel?: () => void
  busy?: boolean
}

export function TripForm({ initial, submitLabel, onSubmit, onCancel, busy }: TripFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Trip name is required')
      return
    }
    if (startDate && endDate && endDate < startDate) {
      setError('End date must be after start date')
      return
    }
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        country: country.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save trip')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="trip-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="trip-name"
          placeholder="Summer in Japan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="trip-description">Description</Label>
        <Textarea
          id="trip-description"
          placeholder="What's this trip about?"
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="trip-country">Country</Label>
        <Input
          id="trip-country"
          placeholder="Japan"
          value={country ?? ''}
          onChange={(e) => setCountry(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Setting a country lets us suggest POIs from your past trips there.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="trip-start">Start date</Label>
          <Input
            id="trip-start"
            type="date"
            value={startDate ?? ''}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trip-end">End date</Label>
          <Input
            id="trip-end"
            type="date"
            value={endDate ?? ''}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy || !name.trim()}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
