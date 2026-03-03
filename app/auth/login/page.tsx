'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import type { Provider } from '@supabase/supabase-js'

const PROVIDERS: { name: string; provider: Provider }[] = [
  { name: 'Discord', provider: 'discord' },
]

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: Provider) => {
    const supabase = createClient()
    setIsLoading(provider)
    setError(null)

    const redirectTo = `${window.location.origin}/auth/callback`
    console.log("[v0] OAuth login attempt:", { provider, redirectTo, origin: window.location.origin })

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      })
      console.log("[v0] OAuth response:", { data, error })
      if (error) throw error
    } catch (err: unknown) {
      console.log("[v0] OAuth error:", err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(null)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Game-World
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in with your existing account to join the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {PROVIDERS.map(({ name, provider }: { name: string; provider: Provider }) => (
                  <Button
                    key={provider}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-secondary"
                    disabled={isLoading !== null}
                    onClick={() => handleOAuthLogin(provider)}
                  >
                    {isLoading === provider
                      ? 'Redirecting...'
                      : `Continue with ${name}`}
                  </Button>
                ))}
              </div>
              {error && (
                <p className="mt-4 text-center text-sm text-destructive">
                  {error}
                </p>
              )}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By signing in, you confirm you are at least 16 years old and
                agree to our community guidelines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
