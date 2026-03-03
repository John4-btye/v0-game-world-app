import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LandingPage() {
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
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    </main>
  )
}
