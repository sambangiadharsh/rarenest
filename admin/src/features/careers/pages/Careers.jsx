import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
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
import RichTextEditor from '@/shared/components/editors/RichTextEditor'
import {
  useCareersAdmin,
  useCreateCareer,
  useUpdateCareer,
  useDeleteCareer,
} from '@/features/careers'

const selectClassName =
  'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const emptyForm = {
  title: '',
  department: '',
  location: '',
  employment_type: '',
  experience_level: '',
  description: '',
  requirements: '',
  salary_range: '',
  application_email: '',
  status: 'Open',
}

const careerSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.string().optional(),
  experience_level: z.string().optional(),
  salary_range: z.string().optional(),
  application_email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  status: z.enum(['Open', 'Closed']).default('Open'),
  description: z.string().optional(),
  requirements: z.string().optional(),
})

export default function Careers() {
  const { data, isLoading, isError, error } = useCareersAdmin()
  const { mutateAsync: createCareer, isPending: isCreating } = useCreateCareer()
  const { mutateAsync: updateCareer, isPending: isUpdating } = useUpdateCareer()
  const { mutateAsync: deleteCareer, isPending: isDeleting } = useDeleteCareer()

  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(careerSchema),
    defaultValues: emptyForm,
  })

  const careers = data?.data ?? []
  const isSaving = isCreating || isUpdating

  const openCreate = () => {
    setEditingId(null)
    reset(emptyForm)
    setShowForm(true)
  }

  const openEdit = (career) => {
    setEditingId(career.id)
    reset({
      title: career.title || '',
      department: career.department || '',
      location: career.location || '',
      employment_type: career.employment_type || '',
      experience_level: career.experience_level || '',
      description: career.description || '',
      requirements: career.requirements || '',
      salary_range: career.salary_range || '',
      application_email: career.application_email || '',
      status: career.status || 'Open',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset(emptyForm)
  }

  const onSubmit = async (data) => {
    const payload = {
      title: data.title.trim(),
      department: data.department || null,
      location: data.location || null,
      employment_type: data.employment_type || null,
      experience_level: data.experience_level || null,
      description: data.description || null,
      requirements: data.requirements || null,
      salary_range: data.salary_range || null,
      application_email: data.application_email || null,
      status: data.status,
    }

    try {
      if (editingId) {
        const res = await updateCareer({ id: editingId, ...payload })
        if (!res.success) {
          toast.error(res.message || 'Failed to update job.')
          return
        }
        toast.success('Job posting updated.')
      } else {
        const res = await createCareer(payload)
        if (!res.success) {
          toast.error(res.message || 'Failed to create job.')
          return
        }
        toast.success('Job posting created.')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save job posting.')
    }
  }

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Delete this job posting?')) return
  //   try {
  //     await deleteCareer(id)
  //     toast.success('Job posting deleted.')
  //     if (editingId === id) closeForm()
  //   } catch (err) {
  //     toast.error(err.message || 'Failed to delete job posting.')
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
            Careers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage job postings and career page content.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add job
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit job posting' : 'New job posting'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Title *</Label>
                  <Input {...register('title')} className={errors.title ? 'border-destructive' : ''} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input {...register('department')} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...register('location')} />
                </div>
                <div className="space-y-2">
                  <Label>Employment type</Label>
                  <Input {...register('employment_type')} placeholder="Full-time, Part-time..." />
                </div>
                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <Input {...register('experience_level')} />
                </div>
                <div className="space-y-2">
                  <Label>Salary range</Label>
                  <Input {...register('salary_range')} />
                </div>
                <div className="space-y-2">
                  <Label>Application email</Label>
                  <Input type="email" {...register('application_email')} className={errors.application_email ? 'border-destructive' : ''} />
                  {errors.application_email && <p className="text-xs text-destructive">{errors.application_email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select {...register('status')} className={selectClassName}>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <Controller
                  name="requirements"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All job postings</CardTitle>
          <CardDescription>{careers.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">{error?.message || 'Failed to load.'}</p>
          ) : careers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No job postings yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {careers.map((career) => (
                <div
                  key={career.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{career.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[career.department, career.location].filter(Boolean).join(' · ')}
                      {career.department || career.location ? ' · ' : ''}
                      {career.status}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(career)}>
                      <Pencil className="size-4" />
                    </Button>
                    {/* <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(career.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
