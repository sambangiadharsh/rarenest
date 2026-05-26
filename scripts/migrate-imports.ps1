param([string]$Root)

$files = Get-ChildItem -Path $Root -Recurse -Include *.js,*.jsx | Where-Object { $_.FullName -notmatch 'node_modules' }

$replacements = @(
  @('@/lib/apiClient', '@/shared/lib/apiClient'),
  @('@/lib/uploadClient', '@/shared/lib/uploadClient'),
  @('@/lib/queryClient', '@/shared/lib/queryClient'),
  @('@/lib/utils', '@/shared/lib/utils'),
  @('@/lib/authHelpers', '@/shared/lib/authHelpers'),
  @('@/lib/propertyUtils', '@/features/properties/lib/propertyUtils'),
  @('@/components/ui/', '@/shared/components/ui/'),
  @('@/components/layout/', '@/shared/components/layout/'),
  @("@/components/ContentPageLayout", '@/shared/components/content/ContentPageLayout'),
  @("@/components/HtmlContent", '@/shared/components/content/HtmlContent'),
  @("@/components/PropertyCard", '@/features/properties/components/PropertyCard'),
  @("@/components/EnquiryModal", '@/features/enquiries/components/EnquiryModal'),
  @("@/components/SocialIcons", '@/features/contact/components/SocialIcons'),
  @('@/store/', '@/app/store/'),
  @('@/config/', '@/shared/config/'),
  @('@/hooks/usePageMeta', '@/shared/hooks/usePageMeta'),
  @('@/hooks/use-mobile', '@/shared/hooks/use-mobile'),
  @('@/hooks/useAuth', '@/features/auth'),
  @('@/hooks/useProperties', '@/features/properties'),
  @('@/hooks/usePropertyTypes', '@/features/properties'),
  @('@/hooks/useSeller', '@/features/seller'),
  @('@/hooks/useEnquiries', '@/features/enquiries'),
  @('@/hooks/useWishlist', '@/features/wishlist'),
  @('@/hooks/useCms', '@/features/cms'),
  @('@/hooks/useContactInfo', '@/features/contact'),
  @('@/hooks/useFaqs', '@/features/faqs'),
  @('@/hooks/useCareers', '@/features/careers'),
  @("@/components/CmsPageEditor", '@/shared/components/editors/CmsPageEditor'),
  @("@/components/RichTextEditor", '@/shared/components/editors/RichTextEditor'),
  @("@/components/PagePlaceholder", '@/shared/components/editors/PagePlaceholder'),
  @('@/hooks/useCmsPageAdmin', '@/features/cms'),
  @('@/hooks/useUpdateCmsPage', '@/features/cms'),
  @('@/hooks/useFaqsAdmin', '@/features/faqs'),
  @('@/hooks/useCreateFaq', '@/features/faqs'),
  @('@/hooks/useUpdateFaq', '@/features/faqs'),
  @('@/hooks/useDeleteFaq', '@/features/faqs'),
  @('@/hooks/useCareersAdmin', '@/features/careers'),
  @('@/hooks/useCreateCareer', '@/features/careers'),
  @('@/hooks/useUpdateCareer', '@/features/careers'),
  @('@/hooks/useDeleteCareer', '@/features/careers'),
  @('@/hooks/useUpdateContactInfo', '@/features/contact'),
  @('@/hooks/useVerifyProperty', '@/features/properties'),
  @('@/hooks/useCreatePropertyType', '@/features/propertyTypes'),
  @('@/constants/specialFeatures', '@/features/properties/constants/specialFeatures')
)

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  $original = $content
  foreach ($pair in $replacements) {
    $content = $content.Replace($pair[0], $pair[1])
  }
  if ($content -ne $original) {
    Set-Content -Path $file.FullName -Value $content -NoNewline
  }
}

Write-Host "Updated imports in $Root"
