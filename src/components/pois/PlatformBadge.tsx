import { Instagram, Youtube, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Platform } from '@/types/poi'

interface PlatformBadgeProps {
  platform: Platform
  className?: string
}

const META: Record<Platform, { label: string; classes: string; Icon: typeof Instagram }> = {
  instagram: {
    label: 'Instagram',
    classes: 'bg-gradient-to-r from-fuchsia-50 to-orange-50 text-fuchsia-700 border-fuchsia-200',
    Icon: Instagram,
  },
  youtube: {
    label: 'YouTube',
    classes: 'bg-red-50 text-red-700 border-red-200',
    Icon: Youtube,
  },
  tiktok: {
    label: 'TikTok',
    classes: 'bg-gray-900 text-white border-gray-900',
    Icon: Music2,
  },
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const m = META[platform]
  const Icon = m.Icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        m.classes,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  )
}
