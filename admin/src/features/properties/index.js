export { default as PropertiesPage } from './pages/Properties'
export { useProperties, useVerifyProperty, useUpdateProperty } from './hooks/useProperties'
export { useProperty } from './hooks/useProperty'
export {
  getPropertyThumbnail,
  getPropertyImages,
  resolveMediaUrl,
  getStatusBadgeClass,
  getVerificationBadgeClass,
  getVerificationStatus,
  getSellerName,
  formatINR,
  parseSpecialFeatures,
  formatPropertyAge,
  PLACEHOLDER_IMAGE,
} from './lib/propertyUtils'
