import DOMPurify from 'dompurify'

export default function HtmlContent({ html, className = '' }) {
  if (!html) return null

  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })

  return (
    <div
      className={`rich-content text-muted-foreground leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
