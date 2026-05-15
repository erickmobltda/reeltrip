import {
  Utensils,
  BedDouble,
  Eye,
  Sparkles,
  PiggyBank,
  Bus,
  ShoppingBag,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '@/types/poi'

export interface CategoryDef {
  id: CategoryId
  label: string
  icon: LucideIcon
  // tailwind classes for background + text + border
  badgeClass: string
  // tailwind class for the icon circle background on filter chips
  chipClass: string
}

export const POI_CATEGORIES: CategoryDef[] = [
  { id: 'eat',         label: 'Eat',         icon: Utensils,        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',     chipClass: 'bg-orange-100 text-orange-700' },
  { id: 'sleep',       label: 'Sleep',       icon: BedDouble,       badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',     chipClass: 'bg-indigo-100 text-indigo-700' },
  { id: 'see',         label: 'See',         icon: Eye,             badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',              chipClass: 'bg-sky-100 text-sky-700' },
  { id: 'do',          label: 'Do',          icon: Sparkles,        badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',  chipClass: 'bg-fuchsia-100 text-fuchsia-700' },
  { id: 'save-money',  label: 'Save money',  icon: PiggyBank,       badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',  chipClass: 'bg-emerald-100 text-emerald-700' },
  { id: 'transport',   label: 'Transport',   icon: Bus,             badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',        chipClass: 'bg-amber-100 text-amber-800' },
  { id: 'shop',        label: 'Shop',        icon: ShoppingBag,     badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',           chipClass: 'bg-pink-100 text-pink-700' },
  { id: 'other',       label: 'Other',       icon: MoreHorizontal,  badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',           chipClass: 'bg-gray-100 text-gray-700' },
]

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = POI_CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, CategoryDef>
)

export function getCategory(id: string | null | undefined): CategoryDef {
  if (id && id in CATEGORY_BY_ID) return CATEGORY_BY_ID[id as CategoryId]
  return CATEGORY_BY_ID.other
}
