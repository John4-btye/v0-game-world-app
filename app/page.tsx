import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 h-[300px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-[250px] w-[350px] rounded-full bg-chart-3/10 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <Image
          src="/images/logo.png"
          alt="Game-World"
          width={140}
          height={140}
          className="h-[140px] w-auto drop-shadow-[0_0_40px_oklch(0.62_0.24_260/0.3)]"
          priority
        />

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            Game-World
          </h1>
          <p className="mx-auto max-w-md text-pretty text-base text-muted-foreground leading-relaxed md:text-lg">
            Your community hub for gaming. Find communities, chat with friends,
            and connect with gamers worldwide.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="relative overflow-hidden bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Link href="/auth/login">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
              </svg>
              Sign in with Discord
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground/60">
            Free to join. 36+ game communities and counting.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['Community Channels', 'Direct Messaging', 'Friend System', 'Game Tags'].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
