'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Age gate dialog — shown to users who haven't confirmed they are 16+.
 * Must be confirmed before accessing any content.
 */
export function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Age Verification</CardTitle>
          <CardDescription className="text-muted-foreground">
            Game-World requires all users to be at least 16 years old.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            By continuing, you confirm that you are 16 years of age or older
            and agree to our community guidelines and privacy policy.
          </p>
          <Button onClick={onConfirm} className="w-full">
            I am 16 or older
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
