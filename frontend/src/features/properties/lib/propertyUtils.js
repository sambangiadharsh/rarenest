export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'

export function formatPriceOnwards(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr onwards`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L onwards`
  return `${new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)} onwards`
}

export function resolveMediaUrl(url) {
  if (!url) return PLACEHOLDER_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  return `/${url.replace(/^\//, '')}`
}

export function getPropertyThumbnail(property) {
  const thumb = property?.media?.find(
    (m) => m.is_thumbnail && m.media_type === 'Image',
  )
  const first = property?.media?.find((m) => m.media_type === 'Image')
  const url = thumb?.media_url || first?.media_url
  return resolveMediaUrl(url)
}

export function mapPropertyForCard(apiProperty) {
  const typeName = apiProperty.property_type_name || 'Property'
  const city = apiProperty.location_city || ''
  const state = apiProperty.location_state || ''
  const district = apiProperty.location_district || ''
  const locationLabel = [city, state].filter(Boolean).join(', ')

  return {
    id: apiProperty.id,
    title: apiProperty.title,
    property_type: typeName,
    location_city: city,
    location_state: state,
    location_district: district,
    locationLabel: locationLabel || district || '—',
    regionBadge: state || 'India',
    asking_price: apiProperty.asking_price,
    size_sqft: apiProperty.size_sqft,
    image: getPropertyThumbnail(apiProperty),
  }
}

export function getPropertyImages(property) {
  if (!property?.media?.length) return []
  return property.media
    .filter((m) => m.media_type === 'Image')
    .map((m) => resolveMediaUrl(m.media_url))
}

export function parseSpecialFeatures(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
