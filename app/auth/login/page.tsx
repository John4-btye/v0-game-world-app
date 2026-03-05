'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useState } from 'react'
import type { Provider } from '@supabase/supabase-js'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: Provider) => {
    const supabase = createClient()
    setIsLoading(provider)
    setError(null)

    const redirectTo = `${window.location.origin}/auth/callback`

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(null)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-background p-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 h-[250px] w-[350px] rounded-full bg-accent/8 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <span className="relative h-20 w-20">
            <Image
              src="/images/logo.png"
              alt="Game-World"
              fill
              className="object-contain drop-shadow-[0_0_30px_oklch(0.62_0.24_260/0.25)]"
              priority
            />
          </span>

          {/* Card */}
          <div className="w-full rounded-xl border border-border bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <div className="text-center">
              <h1
                className="text-2xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Welcome Back
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to join your gaming communities
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 border-border bg-secondary/50 text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-foreground transition-all"
                disabled={isLoading !== null}
                onClick={() => handleOAuthLogin('discord')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
                {isLoading === 'discord' ? 'Redirecting...' : 'Continue with Discord'}
              </Button>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-destructive">{error}</p>
            )}

            <p className="mt-6 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
              By signing in, you confirm you are at least 16 years old and
              agree to our community guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
