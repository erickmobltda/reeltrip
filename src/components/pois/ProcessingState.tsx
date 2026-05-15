import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HINTS = [
  'Downloading the video…',
  'Transcribing the audio…',
  'Extracting locations and highlights…',
  'Structuring your travel note…',
]

interface ProcessingStateProps {
  startedAt: number
  onCancel: () => void
  onRetry: () => void
}

export function ProcessingState({ startedAt, onCancel, onRetry }: ProcessingStateProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const hint = HINTS[Math.min(Math.floor(elapsed / 10), HINTS.length - 1)]
  const showRetry = elapsed >= 60

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900">Processing your reel</h3>
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
      <p className="mt-2 text-xs text-gray-400">{elapsed}s elapsed · usually takes 20–40s</p>

      {showRetry ? (
        <div className="mt-5 flex flex-col items-center gap-2">
          <p className="text-sm text-amber-700">This is taking longer than expected.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="mt-4" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  )
}
