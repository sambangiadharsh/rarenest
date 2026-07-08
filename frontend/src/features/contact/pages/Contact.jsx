import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import { Button } from '@/shared/components/ui/button'
import { useContactInfo } from '@/features/contact'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from '@/features/contact/components/SocialIcons'
import usePageMeta from '@/shared/hooks/usePageMeta'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
})

export default function Contact() {
  const { data, isLoading } = useContactInfo()
  const contact = data?.data
  
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  })
  
  const [sent, setSent] = useState(false)

  const supportEmail = contact?.support_email

  const contactItems = useMemo(() => ([
    contact?.support_email && {
      label: 'Email',
      value: contact.support_email,
      href: `mailto:${contact.support_email}`,
      icon: Mail,
    },
    contact?.support_phone && {
      label: 'Phone',
      value: contact.support_phone,
      href: `tel:${contact.support_phone}`,
      icon: Phone,
    },
    contact?.office_address && {
      label: 'Office',
      value: contact.office_address,
      icon: MapPin,
    },
  ].filter(Boolean)), [contact])

  const socialLinks = useMemo(() => ([
    contact?.facebook_url && {
      label: 'Facebook',
      href: contact.facebook_url,
      Icon: FacebookIcon,
    },
    contact?.instagram_url && {
      label: 'Instagram',
      href: contact.instagram_url,
      Icon: InstagramIcon,
    },
    contact?.linkedin_url && {
      label: 'LinkedIn',
      href: contact.linkedin_url,
      Icon: LinkedinIcon,
    },
    contact?.twitter_url && {
      label: 'X',
      href: contact.twitter_url,
      Icon: XIcon,
    },
  ].filter(Boolean)), [contact])

  usePageMeta({
    title: 'Contact Us | RareNest',
    description: 'Get in touch with the RareNest team.',
  })

  const onSubmit = (data) => {
    if (!supportEmail) {
      toast.error('Support email is not configured yet.')
      return
    }

    const { name, email, subject, message } = data

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n')

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    toast.success('Your email app is opening with the message ready.')
  }

  return (
    <ContentPageLayout
      title="Contact Us"
      subtitle="Talk to the RareNest team about listings, support, partnerships, or anything that needs a human touch."
      className="max-w-6xl"
    >
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-terracotta/10 text-brand-terracotta">
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
                  Contact Support
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                  How can we help?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Share a few details and we will prepare an email to the RareNest support team.
                </p>
              </div>
            </div>

            <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Your name"
                    className={`h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition ${errors.name ? 'border-destructive focus:ring-3 focus:ring-destructive/15' : 'border-border focus:border-brand-terracotta focus:ring-3 focus:ring-brand-terracotta/15'}`}
                  />
                  {errors.name && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.name.message}</span>}
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className={`h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition ${errors.email ? 'border-destructive focus:ring-3 focus:ring-destructive/15' : 'border-border focus:border-brand-terracotta focus:ring-3 focus:ring-brand-terracotta/15'}`}
                  />
                  {errors.email && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.email.message}</span>}
                </Field>
              </div>

              <Field label="Subject">
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="What should we know?"
                  className={`h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition ${errors.subject ? 'border-destructive focus:ring-3 focus:ring-destructive/15' : 'border-border focus:border-brand-terracotta focus:ring-3 focus:ring-brand-terracotta/15'}`}
                />
                {errors.subject && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.subject.message}</span>}
              </Field>

              <Field label="Message">
                <textarea
                  rows={7}
                  {...register('message')}
                  placeholder="Tell us what you need help with..."
                  className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-6 outline-none transition ${errors.message ? 'border-destructive focus:ring-3 focus:ring-destructive/15' : 'border-border focus:border-brand-terracotta focus:ring-3 focus:ring-brand-terracotta/15'}`}
                />
                {errors.message && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.message.message}</span>}
              </Field>

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  {sent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Message prepared in your email app.
                    </>
                  ) : (
                    <>
                      <MessageSquareText className="h-4 w-4" />
                      Uses your email app to send securely.
                    </>
                  )}
                </p>
                <Button
                  type="submit"
                  disabled={!supportEmail}
                  className="h-11 gap-2 rounded-xl bg-brand-terracotta px-5 text-white hover:bg-brand-bronze-dark"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border bg-brand-forest p-5 text-brand-warm-white shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta-light">
                Contact Information
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">
                Reach the right desk
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-warm-white/75">
                These details are managed from the admin contact info page and update here automatically.
              </p>

              <div className="mt-7 space-y-3">
                {contactItems.length > 0 ? (
                  contactItems.map((item) => (
                    <ContactItem key={item.label} item={item} />
                  ))
                ) : (
                  <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-brand-warm-white/75">
                    Contact details have not been configured yet.
                  </p>
                )}
              </div>
            </section>

            {socialLinks.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Follow RareNest</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Stay close to market updates and curated listings.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:border-brand-terracotta/60 hover:text-brand-terracotta"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      )}
    </ContentPageLayout>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function ContactItem({ item }) {
  const Icon = item.icon
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-terracotta-light">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-brand-warm-white/50">
          {item.label}
        </span>
        <span className="mt-1 block whitespace-pre-line break-words text-sm leading-6 text-brand-warm-white">
          {item.value}
        </span>
      </span>
    </>
  )

  if (!item.href) {
    return (
      <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        {content}
      </div>
    )
  }

  return (
    <a
      href={item.href}
      className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-brand-terracotta-light/60 hover:bg-white/10"
    >
      {content}
    </a>
  )
}
