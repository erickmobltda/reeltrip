import type { Platform } from '@/types/poi'

export function detectPlatform(rawUrl: string): Platform | null {
  if (!rawUrl) return null
  let host: string
  try {
    host = new URL(rawUrl.trim()).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram'
  if (
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtu.be' ||
    host === 'm.youtube.com'
  ) {
    return 'youtube'
  }
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com') || host === 'vm.tiktok.com') {
    return 'tiktok'
  }
  return null
}
