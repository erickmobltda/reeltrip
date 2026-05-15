import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Clock, DollarSign, Bus, BedDouble, Utensils, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TravelNotePracticalInfo } from '@/types/travel-note'

const FIELDS: Array<{
  key: keyof TravelNotePracticalInfo
  label: string
  Icon: typeof Clock
}> = [
  { key: 'best_time_to_visit', label: 'Best time to visit', Icon: Clock },
  { key: 'estimated_cost', label: 'Estimated cost', Icon: DollarSign },
  { key: 'how_to_get_there', label: 'How to get there', Icon: Bus },
  { key: 'accommodation_tips', label: 'Accommodation tips', Icon: BedDouble },
  { key: 'food_tips', label: 'Food tips', Icon: Utensils },
]

interface PracticalInfoProps {
  info: TravelNotePracticalInfo | undefined
}

export function PracticalInfo({ info }: PracticalInfoProps) {
  const [open, setOpen] = useState(false)
  if (!info) return null
  const present = FIELDS.filter((f) => {
    const v = info[f.key]
    return typeof v === 'string' && v.trim().length > 0
  })
  if (present.length === 0) return null
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
        <span>Practical info ({present.length})</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        {present.map(({ key, label, Icon }) => (
          <div key={key} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-0.5 text-sm text-gray-700">{info[key]}</p>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
