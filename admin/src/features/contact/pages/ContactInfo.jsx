import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
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
import { useContactInfo, useUpdateContactInfo } from '@/features/contact'

const schema = z.object({
  support_email: z.union([z.string().email('Invalid email'), z.literal('')]),
  support_phone: z.string().max(20).optional(),
  office_address: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  twitter_url: z.string().optional(),
})

export default function ContactInfo() {
  const { data, isLoading, isError, error } = useContactInfo()
  const { mutateAsync: updateContact, isPending } = useUpdateContactInfo()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      support_email: '',
      support_phone: '',
      office_address: '',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      twitter_url: '',
    },
  })

  useEffect(() => {
    const contact = data?.data
    if (contact) {
      reset({
        support_email: contact.support_email || '',
        support_phone: contact.support_phone || '',
        office_address: contact.office_address || '',
        facebook_url: contact.facebook_url || '',
        instagram_url: contact.instagram_url || '',
        linkedin_url: contact.linkedin_url || '',
        twitter_url: contact.twitter_url || '',
      })
    }
  }, [data, reset])

  const onSubmit = async (formData) => {
    try {
      const res = await updateContact({
        support_email: formData.support_email || null,
        support_phone: formData.support_phone || null,
        office_address: formData.office_address || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
      })
      if (!res.success) {
        toast.error(res.message || 'Failed to save contact info.')
        return
      }
      toast.success('Contact info saved successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to save contact info.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          Contact Info
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage contact details, addresses, and social links shown on the public site.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error?.message || 'Failed to load.'}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact details</CardTitle>
            <CardDescription>Displayed on the public contact page and footer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support email</Label>
                  <Input id="support_email" type="email" {...register('support_email')} />
                  {errors.support_email && (
                    <p className="text-xs text-destructive">{errors.support_email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_phone">Support phone</Label>
                  <Input id="support_phone" {...register('support_phone')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_address">Office address</Label>
                <textarea
                  id="office_address"
                  {...register('office_address')}
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input id="facebook_url" {...register('facebook_url')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input id="instagram_url" {...register('instagram_url')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input id="linkedin_url" {...register('linkedin_url')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter / X URL</Label>
                  <Input id="twitter_url" {...register('twitter_url')} />
                </div>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
