import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import RequireAuth from '@/shared/components/auth/RequireAuth'
import { Button } from '@/shared/components/ui/button'
import { setCredentials } from '@/app/store/authSlice'
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/useProfile'
import usePageMeta from '@/shared/hooks/usePageMeta'

function profileToFormValues(profile) {
  return {
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
  }
}

function ProfileForm() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { data, isLoading, isError } = useProfile()
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()

  const profile = data?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: profileToFormValues(null),
  })

  useEffect(() => {
    if (profile) {
      reset(profileToFormValues(profile))
    }
  }, [profile, reset])

  usePageMeta({
    title: 'My Profile | RareNest',
    description: 'Manage your RareNest account profile.',
  })

  const onSubmit = async (formData) => {
    try {
      const res = await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || '',
      })
      if (res?.success) {
        const updated = res.data
        const name =
          `${updated.first_name || ''} ${updated.last_name || ''}`.trim() ||
          user.email?.split('@')[0]
        dispatch(
          setCredentials({
            ...user,
            name,
            email: updated.email ?? user.email,
            role: updated.role
              ? String(updated.role).toLowerCase()
              : user.role,
          }),
        )
        toast.success('Profile updated successfully.')
      } else {
        toast.error(res?.message || 'Could not update profile.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not update profile.')
    }
  }

  if (isLoading) {
    return (
      <ContentPageLayout title="My Profile" subtitle="Manage your account details.">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-terracotta" />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError || !profile) {
    return (
      <ContentPageLayout title="My Profile" subtitle="Manage your account details.">
        <p className="text-muted-foreground">Could not load your profile. Please try again later.</p>
      </ContentPageLayout>
    )
  }

  return (
    <ContentPageLayout
      title="My Profile"
      subtitle="Manage your account details."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="first_name" className="text-sm font-medium">
              First name
            </label>
            <input
              id="first_name"
              {...register('first_name', { required: 'First name is required' })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="last_name" className="text-sm font-medium">
              Last name
            </label>
            <input
              id="last_name"
              {...register('last_name')}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm font-medium">
            Address
          </label>
          <textarea
            id="address"
            rows={3}
            {...register('address')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white border-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </form>
    </ContentPageLayout>
  )
}

export default function Profile() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  )
}
