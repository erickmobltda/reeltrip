import { useState } from 'react'
import { Link as LinkIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { detectPlatform } from '@/lib/platform'

interface UrlInputFormProps {
  onSubmit: (url: string) => void
  busy?: boolean
}

export function UrlInputForm({ onSubmit, busy }: UrlInputFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const platform = detectPlatform(trimmed)
    if (!platform) {
      setError('Only Instagram, YouTube, and TikTok URLs are supported.')
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="url"
            inputMode="url"
            placeholder="Paste an Instagram, YouTube or TikTok URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(null)
            }}
            className="pl-9"
            disabled={busy}
            required
          />
        </div>
        <Button type="submit" disabled={busy || !url.trim()}>
          {busy ? 'Processing…' : (
            <>
              Save
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  )
}
