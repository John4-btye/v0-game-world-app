import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const displayName = meta.full_name || meta.name || 'Gamer'

  // Fetch user's communities
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, communities(name, slug, icon_url, description)')
    .eq('user_id', user?.id ?? '')
    .limit(6)

  // Fetch featured/popular communities for discovery
  const { data: featured } = await supabase
    .from('communities')
    .select('*')
    .eq('is_nsfw', false)
    .order('created_at', { ascending: true })
    .limit(6)

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your gaming hub awaits. Explore communities, chat with friends, and find your next squad.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/communities"
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-medium text-foreground">Browse Communities</span>
          <span className="text-xs text-muted-foreground">Find your next game group</span>
        </Link>
        <Link
          href="/friends"
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-sm font-medium text-foreground">Find Friends</span>
          <span className="text-xs text-muted-foreground">Connect with other gamers</span>
        </Link>
        <Link
          href="/messages"
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium text-foreground">Messages</span>
          <span className="text-xs text-muted-foreground">Check your conversations</span>
        </Link>
      </div>

      {/* User's communities */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Communities</h2>
          <Link href="/communities" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {memberships && memberships.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m: Record<string, unknown>) => {
              const c = m.communities as { name: string; slug: string; icon_url: string | null; description: string | null } | null
              if (!c) return null
              return (
                <Link
                  key={m.community_id as string}
                  href={`/communities/${c.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
                >
                  {c.icon_url ? (
                    <img src={c.icon_url} alt="" className="h-10 w-10 rounded-lg object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
                      {c.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">You haven't joined any communities yet.</p>
            <Link href="/communities" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              Browse communities
            </Link>
          </div>
        )}
      </section>

      {/* Discover */}
      {featured && featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Discover Communities</h2>
            <Link href="/communities" className="text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <Link
                key={c.id}
                href={`/communities/${c.slug}`}
                className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-3">
                  {c.icon_url ? (
                    <img src={c.icon_url} alt="" className="h-10 w-10 rounded-lg object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
                      {c.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
