import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from '@/features/contact/components/SocialIcons'
import { useContactInfo } from '@/features/contact'

const SOCIAL_LINKS = [
  { key: 'facebook_url', label: 'Facebook', Icon: FacebookIcon },
  { key: 'instagram_url', label: 'Instagram', Icon: InstagramIcon },
  { key: 'linkedin_url', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'twitter_url', label: 'X (Twitter)', Icon: XIcon },
]

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-terracotta">
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children, external = false }) {
  const className =
    'text-xs text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white'

  if (external) {
    return (
      <li>
        <a href={to} className={className}>
          {children}
        </a>
      </li>
    )
  }

  return (
    <li>
      <Link to={to} className={className}>
        {children}
      </Link>
    </li>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { data } = useContactInfo()
  const contact = data?.data

  const getSocialUrl = (key) => {
    const url = contact?.[key]
    return typeof url === 'string' && url.trim() ? url.trim() : null
  }

  return (
    <footer className="mt-auto border-t border-brand-forest-mid/40 bg-brand-forest text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-xl font-black tracking-tight text-white">
                Rare<span className="text-brand-terracotta">Nest</span>
              </span>
            </Link>
            <p className="mt-1 font-serif text-sm italic text-white/60">
              Homes that tell a story.
            </p>
            <p className="mt-2 max-w-sm text-xs leading-snug text-white/55">
              Extraordinary alternative dwellings for buyers worldwide.
            </p>

            {(contact?.support_email ||
              contact?.support_phone ||
              contact?.office_address) && (
              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                {contact.support_email && (
                  <a
                    href={`mailto:${contact.support_email}`}
                    className="flex items-center gap-2 text-xs text-white/70 transition-colors hover:text-white"
                  >
                    <Mail className="size-3.5 shrink-0 text-brand-terracotta" />
                    {contact.support_email}
                  </a>
                )}
                {contact.support_phone && (
                  <a
                    href={`tel:${contact.support_phone}`}
                    className="flex items-center gap-2 text-xs text-white/70 transition-colors hover:text-white"
                  >
                    <Phone className="size-3.5 shrink-0 text-brand-terracotta" />
                    {contact.support_phone}
                  </a>
                )}
                {contact.office_address && (
                  <p className="flex items-start gap-2 text-xs text-white/55">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-terracotta" />
                    <span className="whitespace-pre-line">{contact.office_address}</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="sr-only">Social media</span>
              {SOCIAL_LINKS.map(({ key, label, Icon }) => {
                const url = getSocialUrl(key)
                const iconClass =
                  'inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-terracotta/60'
                const icon = <Icon className="size-4 shrink-0" />

                if (url) {
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`${iconClass} hover:border-brand-terracotta/50 hover:bg-brand-terracotta/15 hover:text-brand-terracotta`}
                    >
                      {icon}
                    </a>
                  )
                }

                return (
                  <span
                    key={key}
                    aria-label={`${label} (not configured)`}
                    className={`${iconClass} cursor-default opacity-50`}
                  >
                    {icon}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-5 sm:col-span-1 lg:col-span-8 lg:grid-cols-3 lg:gap-6">
            <FooterColumn title="Explore">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/properties">Find dwellings</FooterLink>
              <FooterLink to="/#builders" external>
                Verified builders
              </FooterLink>
              <FooterLink to="/#how-it-works" external>
                How it works
              </FooterLink>
            </FooterColumn>

            <FooterColumn title="Company">
              <FooterLink to="/about">About us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/faqs">FAQs</FooterLink>
            </FooterColumn>

            <FooterColumn title="Legal">
              <FooterLink to="/privacy">Privacy policy</FooterLink>
              <FooterLink to="/terms">Terms & conditions</FooterLink>
            </FooterColumn>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
          <p className="text-center text-xs text-white/45 sm:text-left">
            &copy; {currentYear} RareNest. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-white/45">
            <Link to="/privacy" className="transition-colors hover:text-white/80">
              Privacy
            </Link>
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <Link to="/terms" className="transition-colors hover:text-white/80">
              Terms
            </Link>
          </div>

          <p className="text-center text-xs font-medium tracking-wide text-white/40 sm:text-right">
            Discover extraordinary living.
          </p>
        </div>
      </div>
    </footer>
  )
}
