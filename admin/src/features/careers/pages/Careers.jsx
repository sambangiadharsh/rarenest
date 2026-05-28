import { useState } from 'react'
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

export default function Careers() {
  const { data, isLoading, isError, error } = useCareersAdmin()
  const { mutateAsync: createCareer, isPending: isCreating } = useCreateCareer()
  const { mutateAsync: updateCareer, isPending: isUpdating } = useUpdateCareer()
  const { mutateAsync: deleteCareer, isPending: isDeleting } = useDeleteCareer()

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const careers = data?.data ?? []
  const isSaving = isCreating || isUpdating

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (career) => {
    setEditingId(career.id)
    setForm({
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
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      department: form.department || null,
      location: form.location || null,
      employment_type: form.employment_type || null,
      experience_level: form.experience_level || null,
      description: form.description || null,
      requirements: form.requirements || null,
      salary_range: form.salary_range || null,
      application_email: form.application_email || null,
      status: form.status,
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Employment type</Label>
                <Input
                  value={form.employment_type}
                  onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))}
                  placeholder="Full-time, Part-time..."
                />
              </div>
              <div className="space-y-2">
                <Label>Experience level</Label>
                <Input
                  value={form.experience_level}
                  onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Salary range</Label>
                <Input
                  value={form.salary_range}
                  onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Application email</Label>
                <Input
                  type="email"
                  value={form.application_email}
                  onChange={(e) => setForm((f) => ({ ...f, application_email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={selectClassName}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                value={form.description}
                onChange={(description) => setForm((f) => ({ ...f, description }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <RichTextEditor
                value={form.requirements}
                onChange={(requirements) => setForm((f) => ({ ...f, requirements }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
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
