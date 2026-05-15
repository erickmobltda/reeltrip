import { cn } from '@/lib/utils'
import { getCategory } from '@/lib/categories'
import type { CategoryId } from '@/types/poi'

interface CategoryBadgeProps {
  category: CategoryId | string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const c = getCategory(category)
  const Icon = c.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        c.badgeClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  )
}
