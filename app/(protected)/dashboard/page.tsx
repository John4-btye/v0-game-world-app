import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getGameImage } from '@/lib/game-images'
import { LiveActivityFeed } from '@/components/dashboard/live-activity-feed'
import { OnlineFriends } from '@/components/dashboard/online-friends'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const displayName = meta.full_name || meta.name || 'Gamer'

  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, communities(name, slug, icon_url, description)')
    .eq('user_id', user?.id ?? '')
    .limit(6)

  const { data: featured } = await supabase
    .from('communities')
    .select('*')
    .eq('is_nsfw', false)
    .order('created_at', { ascending: true })
    .limit(6)

  // Get activity feed for user's communities
  const memberCommunityIds = memberships?.map(m => m.community_id) ?? []
  const { data: activity } = memberCommunityIds.length > 0
    ? await supabase
        .from('activity_feed')
        .select('*')
        .in('community_id', memberCommunityIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/8 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/8 blur-[40px]" />
        <div className="relative">
          <h1
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            Welcome back, {displayName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Your gaming hub awaits. Explore communities, chat with friends, and find your next squad.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: '/communities',
            label: 'Browse Communities',
            desc: 'Find your next game group',
            color: 'primary' as const,
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
          },
          {
            href: '/friends',
            label: 'Find Friends',
            desc: 'Connect with other gamers',
            color: 'accent' as const,
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            ),
          },
          {
            href: '/messages',
            label: 'Messages',
            desc: 'Check your conversations',
            color: 'primary' as const,
            icon: (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ),
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group relative flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
              action.color === 'accent'
                ? 'hover:border-accent/40 hover:shadow-accent/10'
                : 'hover:border-primary/40 hover:shadow-primary/10'
            }`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              action.color === 'accent' 
                ? 'bg-gradient-to-b from-accent/10 to-transparent' 
                : 'bg-gradient-to-b from-primary/10 to-transparent'
            }`} />
            <span className={`relative transition-transform group-hover:scale-110 ${action.color === 'accent' ? 'text-accent' : 'text-primary'}`}>
              {action.icon}
            </span>
            <span className="relative text-sm font-semibold text-foreground group-hover:text-foreground">{action.label}</span>
            <span className="relative text-xs text-muted-foreground">{action.desc}</span>
          </Link>
        ))}
      </div>

      {/* Live Activity + Friends Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveActivityFeed communityIds={memberCommunityIds} />
        </div>
        <div className="lg:col-span-1">
          <OnlineFriends />
        </div>
      </div>

      {/* User communities */}
      <section>
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            Your Communities
          </h2>
          <Link href="/communities" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {memberships && memberships.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m: Record<string, unknown>) => {
              const c = m.communities as { name: string; slug: string; icon_url: string | null; description: string | null } | null
              if (!c) return null
              const imgSrc = getGameImage(c.slug) || c.icon_url
              return (
                <Link
                  key={m.community_id as string}
                  href={`/communities/${c.slug}`}
                  className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {imgSrc ? (
                    <img src={imgSrc} alt="" className="relative h-10 w-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/30 transition-all" />
                  ) : (
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                      {c.name[0]}
                    </div>
                  )}
                  <div className="relative min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <svg className="relative h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t joined any communities yet.</p>
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
            <h2
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Discover Communities
            </h2>
            <Link href="/communities" className="text-xs font-medium text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => {
              const imgSrc = getGameImage(c.slug) || c.icon_url
              return (
              <Link
                key={c.id}
                href={`/communities/${c.slug}`}
                className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {imgSrc ? (
                  <img src={imgSrc} alt="" className="relative h-10 w-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/30 transition-all" />
                ) : (
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                    {c.name[0]}
                  </div>
                )}
                <div className="relative min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                </div>
                <span className="relative px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Join
                </span>
              </Link>
            )})}
          </div>
        </section>
      )}
    </div>
  )
}
