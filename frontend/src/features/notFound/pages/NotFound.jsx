import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center gap-6 py-12">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
        <Compass className="h-10 w-10 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Architectural Void
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md">
        The exclusive domain you are looking for does not exist or has been archived. Let's return you to familiar ground.
      </p>
      <Button asChild className="gap-2 font-semibold shadow-md">
        <Link to="/">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
