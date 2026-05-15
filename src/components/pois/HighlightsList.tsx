import { Sparkle } from 'lucide-react'

interface HighlightsListProps {
  items: string[] | undefined
}

export function HighlightsList({ items }: HighlightsListProps) {
  if (!items || items.length === 0) return null
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
          <Sparkle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
