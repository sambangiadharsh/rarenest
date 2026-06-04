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

export function parseSpecialFeatures(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return value.trim() ? [value] : []
    }
  }
  return []
}

export function formatPropertyAge(years) {
  const n = Number(years)
  if (Number.isNaN(n) || n < 0) return null
  if (n === 0) return 'New construction'
  if (n === 1) return '1 year'
  return `${n} years`
}

export function getSellerName(property) {
  if (!property) return '—'
  if (property.seller_name) return property.seller_name
  const first = property.seller_first_name || ''
  const last = property.seller_last_name || ''
  const name = [first, last].filter(Boolean).join(' ')
  return name || '—'
}

function isBitTruthy(value) {
  return value === true || value === 1 || value === '1'
}

export function getVerificationStatus(property) {
  if (!property) return 'Pending'
  if (isBitTruthy(property.is_verified)) return 'Verified'
  const visible =
    property.is_visible !== false &&
    property.is_visible !== 0 &&
    property.is_visible !== '0'
  if (!visible) return 'Rejected'
  return 'Pending'
}

export function getVerificationBadgeClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'verified') {
    return 'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800'
  }
  if (key === 'rejected') {
    return 'inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'
  }
  return 'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800'
}

export function formatINR(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function getStatusBadgeClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'available') {
    return 'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800'
  }
  if (key === 'sold') {
    return 'inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'
  }
  if (key === 'pending') {
    return 'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800'
  }
  return 'inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'
}
