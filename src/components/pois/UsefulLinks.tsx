import { ExternalLink } from 'lucide-react'
import type { TravelNoteLink } from '@/types/travel-note'

interface UsefulLinksProps {
  links: TravelNoteLink[] | undefined
}

export function UsefulLinks({ links }: UsefulLinksProps) {
  if (!links || links.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l, idx) => (
        <a
          key={idx}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
        >
          <ExternalLink className="h-3 w-3" />
          {l.label || l.url}
        </a>
      ))}
    </div>
  )
}
