param([string]$Root)

$files = Get-ChildItem -Path $Root -Recurse -Include *.js,*.jsx | Where-Object { $_.FullName -notmatch 'node_modules' }

$replacements = @(
  @('@/lib/apiClient', '@/shared/lib/apiClient'),
  @('@/lib/queryClient', '@/shared/lib/queryClient'),
  @('@/lib/utils', '@/shared/lib/utils'),
  @('@/components/ui/', '@/shared/components/ui/'),
  @('@/components/layout/', '@/shared/components/layout/'),
  @("@/components/CmsPageEditor", '@/shared/components/editors/CmsPageEditor'),
  @("@/components/RichTextEditor", '@/shared/components/editors/RichTextEditor'),
  @("@/components/PagePlaceholder", '@/shared/components/editors/PagePlaceholder'),
  @('@/store/', '@/app/store/'),
  @('@/config/', '@/shared/config/'),
  @('@/hooks/use-mobile', '@/shared/hooks/use-mobile'),
  @('@/hooks/useAuth', '@/features/auth'),
  @('@/hooks/useProperties', '@/features/properties'),
  @('@/hooks/usePropertyTypes', '@/features/propertyTypes'),
  @('@/hooks/useCms', '@/features/cms'),
  @('@/hooks/useContactInfo', '@/features/contact'),
  @('@/hooks/useUpdateContactInfo', '@/features/contact'),
  @('@/hooks/useFaqs', '@/features/faqs'),
  @('@/hooks/useFaqsAdmin', '@/features/faqs'),
  @('@/hooks/useCreateFaq', '@/features/faqs'),
  @('@/hooks/useUpdateFaq', '@/features/faqs'),
  @('@/hooks/useDeleteFaq', '@/features/faqs'),
  @('@/hooks/useCareers', '@/features/careers'),
  @('@/hooks/useCareersAdmin', '@/features/careers'),
  @('@/hooks/useCreateCareer', '@/features/careers'),
  @('@/hooks/useUpdateCareer', '@/features/careers'),
  @('@/hooks/useDeleteCareer', '@/features/careers'),
  @('@/hooks/useVerifyProperty', '@/features/properties'),
  @('@/hooks/useCreatePropertyType', '@/features/propertyTypes'),
  @('@/services/', '@/features/_invalid_services/')
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

Write-Host "Updated admin imports in $Root"
