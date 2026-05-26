import { Mail, MapPin, Phone } from 'lucide-react'
import ContentPageLayout from '@/components/ContentPageLayout'
import { useContactInfo } from '@/hooks/useContactInfo'
import usePageMeta from '@/hooks/usePageMeta'

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
      ) : !contact ? (
        <p className="text-muted-foreground">Contact information is not available yet.</p>
      ) : (
        <div className="space-y-6">
          {contact.support_email && (
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-brand-bronze shrink-0" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${contact.support_email}`}
                  className="text-sm text-muted-foreground hover:text-brand-bronze transition-colors"
                >
                  {contact.support_email}
                </a>
              </div>
            </div>
          )}

          {contact.support_phone && (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-brand-bronze shrink-0" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <a
                  href={`tel:${contact.support_phone}`}
                  className="text-sm text-muted-foreground hover:text-brand-bronze transition-colors"
                >
                  {contact.support_phone}
                </a>
              </div>
            </div>
          )}

          {contact.office_address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-brand-bronze shrink-0" />
              <div>
                <p className="text-sm font-medium">Office</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {contact.office_address}
                </p>
              </div>
            </div>
          )}

          {(contact.facebook_url ||
            contact.instagram_url ||
            contact.linkedin_url ||
            contact.twitter_url) && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-3">Follow us</p>
              <div className="flex flex-wrap gap-4">
                {contact.facebook_url && (
                  <a
                    href={contact.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-brand-bronze"
                  >
                    Facebook
                  </a>
                )}
                {contact.instagram_url && (
                  <a
                    href={contact.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-brand-bronze"
                  >
                    Instagram
                  </a>
                )}
                {contact.linkedin_url && (
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-brand-bronze"
                  >
                    LinkedIn
                  </a>
                )}
                {contact.twitter_url && (
                  <a
                    href={contact.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-brand-bronze"
                  >
                    X / Twitter
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </ContentPageLayout>
  )
}
