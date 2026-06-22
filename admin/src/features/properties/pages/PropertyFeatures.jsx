import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2, Pencil, Plus, Tags, X, Check,
  Search, Sparkles, Folder, ArrowUpDown, Calendar, User, Hash
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useFeatures,
  useCreateFeature,
  useUpdateFeature
} from '@/features/properties'

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────

const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Max 100 characters'),
  display_order: z.coerce.number().int().min(0, 'Must be 0 or greater').default(0),
})

const categoryEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Max 100 characters'),
  display_order: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  is_active: z.boolean(),
})

const featureCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Max 150 characters'),
  category_id: z.string().uuid('Select a valid category'),
  is_popular: z.boolean().default(false),
  display_order: z.coerce.number().int().min(0, 'Must be 0 or greater').default(0),
})

const featureEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Max 150 characters'),
  category_id: z.string().uuid('Select a valid category'),
  is_popular: z.boolean(),
  display_order: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  is_active: z.boolean(),
})

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ActiveBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      Inactive
    </span>
  )
}

function PopularBadge({ popular }) {
  return popular ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
    
      Popular
    </span>
  ) : null
}

function OrderChip({ order }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground tabular-nums">
      {order}
    </span>
  )
}

// ─── INLINE EDIT CATEGORY ROW ─────────────────────────────────────────────────

function EditCategoryRow({ category, onSave, onCancel, isUpdating }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: {
      name: category.Name,
      display_order: category.DisplayOrder ?? 0,
      is_active: !!category.IsActive,
    },
  })

  const isActive = watch('is_active')

  return (
    <tr className="border-b border-brand-forest/20 bg-brand-forest/[0.03]">
      <td colSpan={8} className="px-4 py-4">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="size-3.5 text-brand-forest" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
              Editing Category: {category.Name}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="edit-cat-name" className="text-xs">Category Name</Label>
              <Input
                id="edit-cat-name"
                className="h-8 text-sm"
                {...register('name')}
                disabled={isUpdating}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-cat-order" className="text-xs">Display Order</Label>
              <Input
                id="edit-cat-order"
                type="number"
                min={0}
                className="h-8 text-sm"
                {...register('display_order')}
                disabled={isUpdating}
              />
              {errors.display_order && (
                <p className="text-xs text-destructive">{errors.display_order.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <div className="flex gap-2">
                {[
                  { val: true, label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                  { val: false, label: 'Inactive', color: 'text-muted-foreground bg-muted border-border' },
                ].map(({ val, label, color }) => (
                  <button
                    key={String(val)}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setValue('is_active', val, { shouldValidate: true })}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive === val ? `${color} ring-1 ring-current` : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isUpdating}
              className="gap-1.5 bg-brand-forest text-white hover:bg-brand-forest-mid"
            >
              {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Save changes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isUpdating}>
              <X className="size-3.5" />
              Cancel
            </Button>
          </div>
        </form>
      </td>
    </tr>
  )
}

// ─── INLINE EDIT FEATURE ROW ──────────────────────────────────────────────────

function EditFeatureRow({ feature, categories, onSave, onCancel, isUpdating }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(featureEditSchema),
    defaultValues: {
      name: feature.Name,
      category_id: feature.CategoryId,
      is_popular: !!feature.IsPopular,
      display_order: feature.DisplayOrder ?? 0,
      is_active: !!feature.IsActive,
    },
  })

  const isActive = watch('is_active')
  const isPopular = watch('is_popular')

  return (
    <tr className="border-b border-brand-forest/20 bg-brand-forest/[0.03]">
      <td colSpan={9} className="px-4 py-4">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="size-3.5 text-brand-forest" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
              Editing Feature: {feature.Name}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-feat-name" className="text-xs">Feature Name</Label>
              <Input
                id="edit-feat-name"
                className="h-8 text-sm"
                {...register('name')}
                disabled={isUpdating}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-feat-category" className="text-xs">Category</Label>
              <select
                id="edit-feat-category"
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('category_id')}
                disabled={isUpdating}
              >
                {categories.map((cat) => (
                  <option key={cat.Id} value={cat.Id}>
                    {cat.Name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-destructive">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-feat-order" className="text-xs">Display Order</Label>
              <Input
                id="edit-feat-order"
                type="number"
                min={0}
                className="h-8 text-sm"
                {...register('display_order')}
                disabled={isUpdating}
              />
              {errors.display_order && (
                <p className="text-xs text-destructive">{errors.display_order.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Popular?</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setValue('is_popular', !isPopular, { shouldValidate: true })}
                    className={`flex h-8 w-full items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                      isPopular
                        ? 'text-amber-700 bg-amber-50 border-amber-300 ring-1 ring-current'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <div className="flex gap-1.5">
                  {[
                    { val: true, label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                    { val: false, label: 'Inactive', color: 'text-muted-foreground bg-muted border-border' },
                  ].map(({ val, label, color }) => (
                    <button
                      key={String(val)}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => setValue('is_active', val, { shouldValidate: true })}
                      className={`flex-1 h-8 rounded-lg border px-2 text-xs font-medium transition-all ${
                        isActive === val ? `${color} ring-1 ring-current` : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isUpdating}
              className="gap-1.5 bg-brand-forest text-white hover:bg-brand-forest-mid"
            >
              {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Save changes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isUpdating}>
              <X className="size-3.5" />
              Cancel
            </Button>
          </div>
        </form>
      </td>
    </tr>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PropertyFeatures() {
  const [activeTab, setActiveTab] = useState('categories') // 'categories' | 'features'

  const { data: categoriesRes, isLoading: catsLoading, isError: catsError } = useCategories()
  const { mutateAsync: createCategory, isPending: isCreatingCat } = useCreateCategory()
  const { mutateAsync: updateCategory, isPending: isUpdatingCat } = useUpdateCategory()

  const { data: featuresRes, isLoading: featsLoading, isError: featsError } = useFeatures()
  const { mutateAsync: createFeature, isPending: isCreatingFeat } = useCreateFeature()
  const { mutateAsync: updateFeature, isPending: isUpdatingFeat } = useUpdateFeature()

  const [editingId, setEditingId] = useState(null)
  const [categorySearch, setCategorySearch] = useState('')
  const [featureSearch, setFeatureSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [catSortOrder, setCatSortOrder] = useState('asc')
  const [featSortOrder, setFeatSortOrder] = useState('asc')

  // Forms
  const {
    register: registerCreateCat,
    handleSubmit: handleCreateCatSubmit,
    reset: resetCreateCat,
    formState: { errors: createCatErrors },
  } = useForm({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: '', display_order: 0 },
  })

  const {
    register: registerCreateFeat,
    handleSubmit: handleCreateFeatSubmit,
    reset: resetCreateFeat,
    formState: { errors: createFeatErrors },
  } = useForm({
    resolver: zodResolver(featureCreateSchema),
    defaultValues: { name: '', category_id: '', is_popular: false, display_order: 0 },
  })

  const categories = categoriesRes?.data ?? []
  const features = featuresRes?.data ?? []

  const activeCategories = categories.filter((c) => c.IsActive)

  const filteredCategories = categories.filter((c) => {
    return c.Name.toLowerCase().includes(categorySearch.toLowerCase())
  }).sort((a, b) => {
    return catSortOrder === 'asc' ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name)
  })

  const filteredFeatures = features.filter((f) => {
    const matchesSearch = f.Name.toLowerCase().includes(featureSearch.toLowerCase())
    const matchesCat = categoryFilter === 'all' || f.CategoryId === categoryFilter
    return matchesSearch && matchesCat
  }).sort((a, b) => {
    return featSortOrder === 'asc' ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name)
  })

  const onCreateCatSubmit = async (formData) => {
    try {
      const res = await createCategory(formData)
      if (!res.success) { toast.error(res.message || 'Failed to create.'); return }
      toast.success(`Category "${res.data.Name}" added successfully.`)
      resetCreateCat()
    } catch (err) {
      toast.error(err.message || 'Failed to create category.')
    }
  }

  const onCreateFeatSubmit = async (formData) => {
    try {
      const res = await createFeature(formData)
      if (!res.success) { toast.error(res.message || 'Failed to create.'); return }
      toast.success(`Feature "${res.data.Name}" added successfully.`)
      resetCreateFeat()
    } catch (err) {
      toast.error(err.message || 'Failed to create feature.')
    }
  }

  const onEditCatSave = async (formData) => {
    try {
      const res = await updateCategory({
        id: editingId,
        ...formData
      })
      if (!res.success) { toast.error(res.message || 'Failed to update.'); return }
      toast.success(`Category "${res.data.Name}" updated successfully.`)
      setEditingId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update category.')
    }
  }

  const onEditFeatSave = async (formData) => {
    try {
      const res = await updateFeature({
        id: editingId,
        ...formData
      })
      if (!res.success) { toast.error(res.message || 'Failed to update.'); return }
      toast.success(`Feature "${res.data.Name}" updated successfully.`)
      setEditingId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update feature.')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
            Property Features
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Categories and Features loaded dynamically on property forms.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('categories'); setEditingId(null) }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Feature Categories ({categories.length})
        </button>
        <button
          onClick={() => { setActiveTab('features'); setEditingId(null) }}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'features'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Features ({features.length})
        </button>
      </div>

      {/* ── TAB 1: CATEGORIES ── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <Plus className="size-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add new category
              </h2>
            </div>
            <div className="p-4">
              <form
                onSubmit={handleCreateCatSubmit(onCreateCatSubmit)}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="catName" className="text-xs font-medium">Category Name</Label>
                  <Input
                    id="catName"
                    placeholder="e.g. Amenities, Security, Utilities…"
                    className="h-9"
                    {...registerCreateCat('name')}
                    disabled={isCreatingCat}
                  />
                  {createCatErrors.name && (
                    <p className="text-xs text-destructive">{createCatErrors.name.message}</p>
                  )}
                </div>
                <div className="w-32 space-y-1.5">
                  <Label htmlFor="catOrder" className="text-xs font-medium">Display Order</Label>
                  <Input
                    id="catOrder"
                    type="number"
                    min={0}
                    className="h-9"
                    {...registerCreateCat('display_order')}
                    disabled={isCreatingCat}
                  />
                  {createCatErrors.display_order && (
                    <p className="text-xs text-destructive">{createCatErrors.display_order.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isCreatingCat}
                  className="h-9 gap-1.5 bg-brand-forest text-white hover:bg-brand-forest-mid"
                >
                  {isCreatingCat ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Add Category
                </Button>
              </form>
            </div>
          </div>

          {/* Categories List */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Folder className="size-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All Categories
                </h2>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="h-8 pl-8 text-xs"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
            </div>

            {catsLoading && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            )}

            {catsError && (
              <div className="px-4 py-6 text-center text-sm text-destructive">
                Failed to load categories.
              </div>
            )}

            {!catsLoading && !catsError && filteredCategories.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No categories found.
              </div>
            )}

            {!catsLoading && !catsError && filteredCategories.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th 
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none"
                        onClick={() => setCatSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Name</span>
                          <ArrowUpDown className={`size-3 transition-opacity ${catSortOrder ? 'opacity-100 text-brand-forest' : 'opacity-40'}`} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Hash className="size-3 opacity-55" />
                          Order
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created By</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated By</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 opacity-55" />
                          Created
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                      <th className="w-16 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCategories.map((cat) => (
                      <Fragment key={cat.Id}>
                        <tr className={`group transition-colors ${editingId === cat.Id ? 'bg-brand-forest/[0.04]' : 'hover:bg-muted/30'}`}>
                          <td className="px-4 py-3.5 font-medium text-foreground">{cat.Name}</td>
                          <td className="px-4 py-3.5"><ActiveBadge active={!!cat.IsActive} /></td>
                          <td className="px-4 py-3.5"><OrderChip order={cat.DisplayOrder ?? 0} /></td>
                          <td className="px-4 py-3.5 text-muted-foreground">{cat.created_by_name || '—'}</td>
                          <td className="px-4 py-3.5 text-muted-foreground">{cat.updated_by_name || '—'}</td>
                          <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(cat.CreatedAt)}</td>
                          <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(cat.UpdatedAt)}</td>
                          <td className="px-4 py-3.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(editingId === cat.Id ? null : cat.Id)}
                              disabled={editingId !== null && editingId !== cat.Id}
                              className={`h-7 px-2.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${editingId === cat.Id ? 'opacity-100 text-brand-forest' : ''}`}
                            >
                              {editingId === cat.Id ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
                              {editingId === cat.Id ? 'Close' : 'Edit'}
                            </Button>
                          </td>
                        </tr>
                        {editingId === cat.Id && (
                          <EditCategoryRow
                            category={cat}
                            onSave={onEditCatSave}
                            onCancel={() => setEditingId(null)}
                            isUpdating={isUpdatingCat}
                          />
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: FEATURES ── */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Add Feature Form */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <Plus className="size-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add new feature
              </h2>
            </div>
            <div className="p-4">
              <form
                onSubmit={handleCreateFeatSubmit(onCreateFeatSubmit)}
                className="grid gap-4 sm:grid-cols-4 items-end"
              >
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="featName" className="text-xs font-medium">Feature Name</Label>
                  <Input
                    id="featName"
                    placeholder="e.g. Lift, Parking, Swimming Pool…"
                    className="h-9"
                    {...registerCreateFeat('name')}
                    disabled={isCreatingFeat}
                  />
                  {createFeatErrors.name && (
                    <p className="text-xs text-destructive">{createFeatErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="featCategory" className="text-xs font-medium">Category</Label>
                  <select
                    id="featCategory"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...registerCreateFeat('category_id')}
                    disabled={isCreatingFeat}
                  >
                    <option value="">Select Category...</option>
                    {activeCategories.map((cat) => (
                      <option key={cat.Id} value={cat.Id}>
                        {cat.Name}
                      </option>
                    ))}
                  </select>
                  {createFeatErrors.category_id && (
                    <p className="text-xs text-destructive">{createFeatErrors.category_id.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="featOrder" className="text-xs font-medium">Display Order</Label>
                  <Input
                    id="featOrder"
                    type="number"
                    min={0}
                    className="h-9"
                    {...registerCreateFeat('display_order')}
                    disabled={isCreatingFeat}
                  />
                  {createFeatErrors.display_order && (
                    <p className="text-xs text-destructive">{createFeatErrors.display_order.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-brand-forest focus:ring-brand-forest"
                      {...registerCreateFeat('is_popular')}
                      disabled={isCreatingFeat}
                    />
                    Mark as Popular
                  </label>
                  <Button
                    type="submit"
                    disabled={isCreatingFeat}
                    className="h-9 gap-1.5 bg-brand-forest text-white hover:bg-brand-forest-mid ml-auto"
                  >
                    {isCreatingFeat ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add Feature
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Features List */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Tags className="size-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All Features
                </h2>
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-brand-forest/40"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.Id} value={cat.Id}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search features..."
                    className="h-8 pl-8 text-xs"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {featsLoading && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            )}

            {featsError && (
              <div className="px-4 py-6 text-center text-sm text-destructive">
                Failed to load features.
              </div>
            )}

            {!featsLoading && !featsError && filteredFeatures.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No features found.
              </div>
            )}

            {!featsLoading && !featsError && filteredFeatures.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th 
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none"
                        onClick={() => setFeatSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Name</span>
                          <ArrowUpDown className={`size-3 transition-opacity ${featSortOrder ? 'opacity-100 text-brand-forest' : 'opacity-40'}`} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popularity</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created By</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated By</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                      <th className="w-16 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredFeatures.map((feat) => (
                      <Fragment key={feat.Id}>
                        <tr className={`group transition-colors ${editingId === feat.Id ? 'bg-brand-forest/[0.04]' : 'hover:bg-muted/30'}`}>
                          <td className="px-4 py-3.5 font-medium text-foreground">{feat.Name}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-brand-forest/5 px-2 py-1 text-xs font-medium text-brand-forest ring-1 ring-inset ring-brand-forest/10">
                              {feat.category_name}
                            </span>
                          </td>
                          <td className="px-4 py-3.5"><PopularBadge popular={!!feat.IsPopular} /></td>
                          <td className="px-4 py-3.5"><ActiveBadge active={!!feat.IsActive} /></td>
                          <td className="px-4 py-3.5"><OrderChip order={feat.DisplayOrder ?? 0} /></td>
                          <td className="px-4 py-3.5 text-muted-foreground">{feat.created_by_name || '—'}</td>
                          <td className="px-4 py-3.5 text-muted-foreground">{feat.updated_by_name || '—'}</td>
                          <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(feat.CreatedAt)}</td>
                          <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(feat.UpdatedAt)}</td>
                          <td className="px-4 py-3.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(editingId === feat.Id ? null : feat.Id)}
                              disabled={editingId !== null && editingId !== feat.Id}
                              className={`h-7 px-2.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${editingId === feat.Id ? 'opacity-100 text-brand-forest' : ''}`}
                            >
                              {editingId === feat.Id ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
                              {editingId === feat.Id ? 'Close' : 'Edit'}
                            </Button>
                          </td>
                        </tr>
                        {editingId === feat.Id && (
                          <EditFeatureRow
                            feature={feat}
                            categories={categories}
                            onSave={onEditFeatSave}
                            onCancel={() => setEditingId(null)}
                            isUpdating={isUpdatingFeat}
                          />
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
