import { Construction } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

export default function PagePlaceholder({ title, description }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Card className="border-brand-sand">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <Construction className="size-5 text-brand-terracotta" />
            </div>
            <div>
              <CardTitle className="text-base">Coming soon</CardTitle>
              <CardDescription>
                API integration for this section will be added in a later phase.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page is a UI shell. Connect it to the shared Express API when
            backend routes and database tables are ready.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
