import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If already logged in, go straight to dashboard
  if (user) redirect('/dashboard')

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl">
        Game-World
      </h1>
      <p className="mt-4 max-w-lg text-pretty text-lg text-muted-foreground">
        Your community hub for gaming. Find communities, chat with friends, and
        connect with gamers worldwide.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/auth/login">Sign In with Discord</Link>
        </Button>
      </div>
    </main>
  )
}
