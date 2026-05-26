import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ContentPageLayout from '@/components/ContentPageLayout'
import HtmlContent from '@/components/HtmlContent'
import { useFaqs } from '@/hooks/useFaqs'
import usePageMeta from '@/hooks/usePageMeta'
import { cn } from '@/lib/utils'

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-foreground">{faq.question}</span>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-5 text-muted-foreground">
          <HtmlContent html={faq.answer} />
        </div>
      )}
    </div>
  )
}

export default function Faqs() {
  const { data, isLoading } = useFaqs()
  const faqs = data?.data ?? []
  const [openId, setOpenId] = useState(null)

  usePageMeta({
    title: 'FAQs | RareNest',
    description: 'Frequently asked questions about RareNest.',
  })

  return (
    <ContentPageLayout
      title="Frequently Asked Questions"
      subtitle="Answers to common questions about RareNest."
    >
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-full rounded bg-muted" />
          <div className="h-12 w-full rounded bg-muted" />
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs available yet.</p>
      ) : (
        <div>
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      )}
    </ContentPageLayout>
  )
}
