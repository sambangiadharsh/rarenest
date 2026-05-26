import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  usePropertyTypes,
  useCreatePropertyType,
} from '@/features/propertyTypes'

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
})

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PropertyTypes() {
  const { data, isLoading, isError, error } = usePropertyTypes()
  const { mutateAsync: createPropertyType, isPending: isCreating } =
    useCreatePropertyType()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '' },
  })

  const propertyTypes = data?.data ?? []

  const onSubmit = async (formData) => {
    try {
      const res = await createPropertyType({ name: formData.name.trim() })
      if (!res.success) {
        toast.error(res.message || 'Failed to create property type.')
        return
      }
      toast.success(`"${res.data.name}" added successfully.`)
      reset()
    } catch (err) {
      toast.error(err.message || 'Failed to create property type.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          Property Type
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage property type options used across listings.
        </p>
      </div>

      <Card className="border-brand-sand">
        <CardHeader>
          <CardTitle className="text-base">Add property type</CardTitle>
          <CardDescription>
            Enter a unique name. Active status and display order use defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Treehouse"
                {...register('name')}
                disabled={isCreating}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add type
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-brand-sand">
        <CardHeader>
          <CardTitle className="text-base">All property types</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading...'
              : `${propertyTypes.length} type${propertyTypes.length === 1 ? '' : 's'} registered`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {error?.message || 'Failed to load property types.'}
            </p>
          )}

          {!isLoading && !isError && propertyTypes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Tags className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No property types yet. Add one above to get started.
              </p>
            </div>
          )}

          {!isLoading && !isError && propertyTypes.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{type.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {type.is_active ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {type.display_order ?? 0}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(type.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
