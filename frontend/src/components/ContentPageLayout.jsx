export default function ContentPageLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  )
}
