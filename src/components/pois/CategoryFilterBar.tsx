import { POI_CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'
import type { CategoryId } from '@/types/poi'

interface CategoryFilterBarProps {
  selected: CategoryId | 'all'
  onSelect: (id: CategoryId | 'all') => void
  counts: Partial<Record<CategoryId, number>>
  total: number
}

export function CategoryFilterBar({ selected, onSelect, counts, total }: CategoryFilterBarProps) {
  return (
    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => onSelect('all')}
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition',
            selected === 'all'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          All
          <span className="opacity-70">{total}</span>
        </button>
        {POI_CATEGORIES.map((c) => {
          const Icon = c.icon
          const n = counts[c.id] ?? 0
          const isActive = selected === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              disabled={n === 0 && selected !== c.id}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition',
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : n === 0
                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
              <span className="opacity-70">{n}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
