import { getApiOrigin } from '@/shared/config/api'

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'

function isImageMedia(media) {
  return String(media?.media_type || '').toLowerCase() === 'image'
}

function isThumbnailMedia(media) {
  return media?.is_thumbnail === true || media?.is_thumbnail === 1 || media?.is_thumbnail === '1'
}

export function resolveMediaUrl(url) {
  if (!url) return PLACEHOLDER_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const path = url.startsWith('/') ? url : `/${url.replace(/^\//, '')}`
  if (path.startsWith('/uploads/')) {
    const origin = getApiOrigin()
    return origin ? `${origin}${path}` : path
  }
  return path
}

export function getPropertyThumbnail(property) {
  const images = property?.media?.filter(isImageMedia) || []
  const thumb = images.find(isThumbnailMedia)
  const first = images[0]
  const url = thumb?.media_url || first?.media_url
  return resolveMediaUrl(url)
}

export function getPropertyImages(property) {
  if (!property?.media?.length) return []
  return property.media
    .filter(isImageMedia)
    .map((m) => resolveMediaUrl(m.media_url))
}
