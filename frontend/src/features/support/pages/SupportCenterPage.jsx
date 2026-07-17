import { Link } from 'react-router-dom'
import { Headphones, HelpCircle, MessageSquarePlus, Ticket } from 'lucide-react'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import { Button } from '@/shared/components/ui/button'

export default function SupportCenterPage() {
  return (
    <ContentPageLayout
      title="Help & Support"
      subtitle="Get help with your account, listings, or technical issues"
      icon={Headphones}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-sand bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <Ticket className="mb-3 h-8 w-8 text-brand-terracotta" />
          <h3 className="mb-2 font-semibold">My Tickets</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            View and reply to your support tickets.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/support/tickets">View tickets</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-brand-sand bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <MessageSquarePlus className="mb-3 h-8 w-8 text-brand-terracotta" />
          <h3 className="mb-2 font-semibold">Create Ticket</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Submit a new support request with our team.
          </p>
          <Button asChild className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90">
            <Link to="/support/new">Create ticket</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-brand-sand bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <HelpCircle className="mb-3 h-8 w-8 text-brand-terracotta" />
          <h3 className="mb-2 font-semibold">FAQs</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Find answers to common questions.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/faqs">Browse FAQs</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Need immediate help?{' '}
          <Link to="/contact" className="font-medium text-brand-terracotta hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </ContentPageLayout>
  )
}
