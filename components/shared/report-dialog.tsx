'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ReportReason } from '@/lib/types'

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'nsfw', label: 'Inappropriate content (NSFW)' },
  { value: 'underage', label: 'Underage user' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'other', label: 'Other' },
]

/**
 * Report dialog — allows users to report content or other users.
 * Stub: will be wired up to the reports API.
 */
export function ReportDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (reason: ReportReason, description: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Report</CardTitle>
          <CardDescription className="text-muted-foreground">
            Help us keep Game-World safe. Select a reason below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.value}
              className="rounded-md border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
              onClick={() => onSubmit(reason.value, '')}
            >
              {reason.label}
            </button>
          ))}
          <Button variant="outline" onClick={onClose} className="mt-2">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
