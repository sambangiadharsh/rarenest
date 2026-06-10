import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2, Pencil, Plus, Tags, X, Check,
  ArrowUpDown, Calendar, User, Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  usePropertyTypes,
  useCreatePropertyType,
  useUpdatePropertyType,
} from '@/features/propertyTypes'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Max 100 characters'),
})

const editSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Max 100 characters'),
  display_order: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  is_active: z.boolean(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Small atoms ─────────────────────────────────────────────────────────────

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

function OrderChip({ order }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground tabular-nums">
      {order}
    </span>
  )
}

// ─── Inline edit form ─────────────────────────────────────────────────────────

function EditRow({ type, onSave, onCancel, isUpdating }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: type.name,
      display_order: type.display_order ?? 0,
      is_active: !!type.is_active,
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
              Editing: {type.name}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Name */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="edit-name" className="text-xs">Name</Label>
              <Input
                id="edit-name"
                className="h-8 text-sm"
                {...register('name')}
                disabled={isUpdating}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Display order */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-order" className="text-xs">Display order</Label>
              <Input
                id="edit-order"
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

            {/* Status toggle */}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PropertyTypes() {
  const { data, isLoading, isError, error } = usePropertyTypes()
  const { mutateAsync: createPropertyType, isPending: isCreating } = useCreatePropertyType()
  const { mutateAsync: updatePropertyType, isPending: isUpdating } = useUpdatePropertyType()

  const [editingId, setEditingId] = useState(null)

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '' },
  })

  const propertyTypes = data?.data ?? []

  const onCreateSubmit = async (formData) => {
    try {
      const res = await createPropertyType({ name: formData.name.trim() })
      if (!res.success) { toast.error(res.message || 'Failed to create.'); return }
      toast.success(`"${res.data.name}" added successfully.`)
      resetCreate()
    } catch (err) {
      toast.error(err.message || 'Failed to create property type.')
    }
  }

  const onEditSave = async (formData) => {
    try {
      const res = await updatePropertyType({
        id: editingId,
        name: formData.name.trim(),
        display_order: formData.display_order,
        is_active: formData.is_active,
      })
      if (!res.success) { toast.error(res.message || 'Failed to update.'); return }
      toast.success(`"${res.data.name}" updated successfully.`)
      setEditingId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update property type.')
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
            Property Types
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage property categories used across listings.
          </p>
        </div>
        <div className="rounded-full bg-brand-forest/8 px-3 py-1 text-xs font-medium text-brand-forest">
          {isLoading ? '…' : `${propertyTypes.length} type${propertyTypes.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* ── Add form ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <Plus className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add new type
          </h2>
        </div>
        <div className="p-4">
          <form
            onSubmit={handleCreateSubmit(onCreateSubmit)}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Type name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Treehouse, Farmhouse, Studio…"
                className="h-9"
                {...registerCreate('name')}
                disabled={isCreating}
              />
              {createErrors.name && (
                <p className="text-xs text-destructive">{createErrors.name.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isCreating}
              className="h-9 gap-1.5 bg-brand-forest text-white hover:bg-brand-forest-mid"
            >
              {isCreating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add type
            </Button>
          </form>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Tags className="size-3.5 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All property types
            </h2>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-0 divide-y divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-6 rounded-md" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-destructive">{error?.message || 'Failed to load property types.'}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && propertyTypes.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Tags className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No property types yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add your first type using the form above to get started.
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && propertyTypes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <ArrowUpDown className="size-3 opacity-40" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Hash className="size-3 opacity-50" />
                      Order
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="size-3 opacity-50" />
                      Created by
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated by</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 opacity-50" />
                      Created
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {propertyTypes.map((type) => (
                  <Fragment key={type.id}>
                    <tr
                      className={`group transition-colors ${
                        editingId === type.id
                          ? 'bg-brand-forest/[0.04]'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-foreground">{type.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ActiveBadge active={!!type.is_active} />
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderChip order={type.display_order ?? 0} />
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {type.created_by_name?.trim() || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {type.updated_by_name?.trim() || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(type.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(type.updated_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingId(editingId === type.id ? null : type.id)
                          }
                          disabled={editingId !== null && editingId !== type.id && isUpdating}
                          className={`h-7 gap-1.5 px-2.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${
                            editingId === type.id ? 'opacity-100 text-brand-forest' : ''
                          }`}
                        >
                          {editingId === type.id ? (
                            <X className="size-3.5" />
                          ) : (
                            <Pencil className="size-3.5" />
                          )}
                          {editingId === type.id ? 'Close' : 'Edit'}
                        </Button>
                      </td>
                    </tr>

                    {editingId === type.id && (
                      <EditRow
                        type={type}
                        onSave={onEditSave}
                        onCancel={() => setEditingId(null)}
                        isUpdating={isUpdating}
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
  )
}
