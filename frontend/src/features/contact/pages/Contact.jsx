import { Mail, MapPin, Phone } from 'lucide-react'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import { useContactInfo } from '@/features/contact'
import usePageMeta from '@/shared/hooks/usePageMeta'

export default function Contact() {
  const { data, isLoading } = useContactInfo()
  const contact = data?.data

  usePageMeta({
    title: 'Contact Us | RareNest',
    description: 'Get in touch with the RareNest team.',
  })

  return (
    <ContentPageLayout
      title="Contact Us"
      subtitle="We would love to hear from you."
    >
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      ) :  (
       <div className="grid gap-8 lg:grid-cols-2">
  {/* Contact Form */}
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
    <p className="text-sm text-muted-foreground mb-6">
      Have a question or need assistance? Send us a message and our team will get back to you.
    </p>

    <form className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-brand-bronze"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-brand-bronze"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Subject
        </label>
        <input
          type="text"
          placeholder="Enter subject"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-brand-bronze"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Message
        </label>
        <textarea
          rows={6}
          placeholder="Tell us how we can help..."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-brand-bronze resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-bronze px-4 py-3 text-white font-semibold hover:opacity-90 transition"
      >
        Send Message
      </button>
    </form>
  </div>

  {/* Contact Details */}
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <h2 className="text-xl font-semibold mb-6">
      Contact Information
    </h2>

    <div className="space-y-6">
      {contact?.support_email && (
        <div className="flex items-start gap-4">
          <Mail className="mt-1 h-5 w-5 text-brand-bronze shrink-0" />
          <div>
            <p className="font-medium">Email</p>
            <a
              href={`mailto:${contact.support_email}`}
              className="text-muted-foreground hover:text-brand-bronze"
            >
              {contact.support_email}
            </a>
          </div>
        </div>
      )}

      {contact?.support_phone && (
        <div className="flex items-start gap-4">
          <Phone className="mt-1 h-5 w-5 text-brand-bronze shrink-0" />
          <div>
            <p className="font-medium">Phone</p>
            <a
              href={`tel:${contact.support_phone}`}
              className="text-muted-foreground hover:text-brand-bronze"
            >
              {contact.support_phone}
            </a>
          </div>
        </div>
      )}

      {contact?.office_address && (
        <div className="flex items-start gap-4">
          <MapPin className="mt-1 h-5 w-5 text-brand-bronze shrink-0" />
          <div>
            <p className="font-medium">Office</p>
            <p className="text-muted-foreground whitespace-pre-line">
              {contact.office_address}
            </p>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-border">
        <h3 className="font-medium mb-3">Follow Us</h3>

        <div className="flex flex-wrap gap-4">
          {contact?.facebook_url && (
            <a
              href={contact.facebook_url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-brand-bronze"
            >
              Facebook
            </a>
          )}

          {contact?.instagram_url && (
            <a
              href={contact.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-brand-bronze"
            >
              Instagram
            </a>
          )}

          {contact?.linkedin_url && (
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-brand-bronze"
            >
              LinkedIn
            </a>
          )}

          {contact?.twitter_url && (
            <a
              href={contact.twitter_url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-brand-bronze"
            >
              X / Twitter
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
</div>)}
    </ContentPageLayout>
  )
}
