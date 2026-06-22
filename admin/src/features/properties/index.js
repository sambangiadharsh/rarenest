export { default as PropertiesPage } from './pages/Properties'
export { useProperties, useVerifyProperty, useUpdateProperty, useToggleFeatured } from './hooks/useProperties'
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

export { default as PropertyFeaturesPage } from './pages/PropertyFeatures'
export {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useFeatures,
  useCreateFeature,
  useUpdateFeature,
} from './hooks/usePropertyFeatures'
