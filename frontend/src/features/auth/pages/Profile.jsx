import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import RequireAuth from '@/shared/components/auth/RequireAuth'
import { Button } from '@/shared/components/ui/button'
import PageLoader from '@/shared/components/ui/PageLoader'
import { setCredentials } from '@/app/store/authSlice'
import { useProfile, useUpdateProfile, useChangePassword } from '@/features/auth/hooks/useProfile'
import usePageMeta from '@/shared/hooks/usePageMeta'

function profileToFormValues(profile) {
  return {
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
  }
}

function ProfileForm({ standalone = true }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { data, isLoading, isError } = useProfile()
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()
  const profile = data?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: profileToFormValues(null),
  })

  useEffect(() => {
    if (profile) reset(profileToFormValues(profile))
  }, [profile, reset])

  usePageMeta({ title: 'My Profile | RareNest', description: 'Manage your RareNest account profile.' })

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
        const name = `${updated.first_name || ''} ${updated.last_name || ''}`.trim() || user.email?.split('@')[0]
        dispatch(setCredentials({ ...user, name, email: updated.email ?? user.email, role: updated.role ? String(updated.role).toLowerCase() : user.role }))
        toast.success('Profile updated.')
      } else {
        toast.error(res?.message || 'Could not update profile.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not update profile.')
    }
  }

  if (isLoading) {
    return (
      <PageLoader />
    )
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Could not load your profile. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="px-7 sm:px-9 pt-8 pb-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-neutral-950 dark:text-white">Edit Profile</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Update your personal information below.</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-brand-sand/50 flex items-center justify-center">
              <User className="h-4 w-4 text-brand-bronze" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-7 sm:px-9 py-7 flex flex-col gap-6">

              {/* Email — read only */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-bronze" /> Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="h-11 w-full rounded-xl bg-neutral-100/70 dark:bg-neutral-800 px-4 text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-400 cursor-not-allowed font-sans outline-none"
                />
                <p className="text-[10px] text-neutral-400">Email address cannot be changed.</p>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100 dark:border-neutral-800" />

              {/* First + Last name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-bronze" /> First Name
                  </label>
                  <input
                    type="text"
                    {...register('first_name', { required: 'First name is required' })}
                    placeholder="Jane"
                    className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                      errors.first_name
                        ? 'border-destructive ring-1 ring-destructive'
                        : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                    }`}
                  />
                  {errors.first_name && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.first_name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-bronze" /> Last Name
                  </label>
                  <input
                    type="text"
                    {...register('last_name')}
                    placeholder="Doe"
                    className="h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border border-neutral-200 dark:border-neutral-800 outline-none transition-all placeholder:text-neutral-400 font-sans focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-brand-bronze" /> Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border border-neutral-200 dark:border-neutral-800 outline-none transition-all placeholder:text-neutral-400 font-sans focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-bronze" /> Address
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="123 Forest Lane, Rishikesh, Uttarakhand"
                  className="w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-800 outline-none transition-all placeholder:text-neutral-400 font-sans resize-y leading-relaxed focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 sm:px-9 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between gap-4">
              <p className="text-xs text-neutral-400">All changes are saved to your account instantly.</p>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold px-6 shadow-lg shadow-brand-bronze/20 gap-2 min-w-[140px]"
              >
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><Save className="h-4 w-4" /> Save Changes</>
                }
              </Button>
            </div>
          </form>
    </div>
  )
}


export default function Profile() {
  return (
    <RequireAuth>
      <div className="bg-brand-cream/30 dark:bg-neutral-950 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          <ProfileForm standalone={false} />
    
        </div>
      </div>
    </RequireAuth>
  )
}
