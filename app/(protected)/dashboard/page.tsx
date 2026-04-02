import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getGameImage } from '@/lib/game-images'
import { LiveActivityFeed } from '@/components/dashboard/live-activity-feed'
import { OnlineFriends } from '@/components/dashboard/online-friends'
import { TestBotPanel } from '@/components/dev/test-bot-panel'
import { RecentConversations } from '@/components/dashboard/recent-conversations'
import { SquadFinder } from '@/components/dashboard/squad-finder'
import { SmartRecommendations } from '@/components/dashboard/smart-recommendations'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const displayName = meta.full_name || meta.name || 'Gamer'

  // Get user's communities
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, communities(id, name, slug, icon_url, description)')
    .eq('user_id', user?.id ?? '')
    .limit(6)

  const memberCommunityIds = memberships?.map(m => m.community_id) ?? []

  // Get trending communities (most members + recent activity)
  const { data: trending } = await supabase
    .from('communities')
    .select('*, community_members(count)')
    .eq('is_nsfw', false)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get active communities (with recent messages)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: activeChannels } = await supabase
    .from('channel_messages')
    .select('channels!inner(community_id, communities!inner(id, name, slug, icon_url))')
    .gte('created_at', fiveMinutesAgo)
    .limit(20)

  // Dedupe active communities and count activity
  const activityMap = new Map<string, { community: any; count: number }>()
  activeChannels?.forEach((msg: any) => {
    const comm = msg.channels?.communities
    if (comm) {
      const existing = activityMap.get(comm.id)
      if (existing) {
        existing.count++
      } else {
        activityMap.set(comm.id, { community: comm, count: 1 })
      }
    }
  })
  const activeCommunities = Array.from(activityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome + Quick Actions Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-[60px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
              {activeCommunities.length > 0 
                ? `${activeCommunities.length} communities are active right now. Jump in!`
                : 'Your gaming hub awaits. Find your squad and start playing.'
              }
            </p>
          </div>
          
          {/* Primary CTA */}
          <div className="flex flex-wrap gap-3">
            {activeCommunities.length > 0 ? (
              <Link
                href={`/communities/${activeCommunities[0].community.slug}`}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Join Active Lobby
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/communities"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95"
              >
                Find Your Squad
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
            <Link
              href="/messages"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg active:scale-95"
            >
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Jump into Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Active Right Now - Hot Section */}
      {activeCommunities.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
            </span>
            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Active Right Now
            </h2>
            <span className="text-xs text-orange-500 font-medium ml-1">HOT</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeCommunities.map(({ community, count }) => {
              const imgSrc = getGameImage(community.slug) || community.icon_url
              return (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="group relative flex items-center gap-3 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-card p-4 transition-all duration-200 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt="" className="h-12 w-12 rounded-lg object-cover ring-2 ring-orange-500/30" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 text-lg font-bold text-orange-500">
                      {community.name[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-orange-500 transition-colors">{community.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        {count} chatting now
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all">
                    Join
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Your Communities - Full Width */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Your Communities
          </h2>
          <Link href="/communities" className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            View all
            <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {memberships && memberships.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m: Record<string, unknown>) => {
              const c = m.communities as { id: string; name: string; slug: string; icon_url: string | null; description: string | null } | null
              if (!c) return null
              const imgSrc = getGameImage(c.slug) || c.icon_url
              const isActive = activeCommunities.some(ac => ac.community.id === c.id)
              return (
                <Link
                  key={m.community_id as string}
                  href={`/communities/${c.slug}`}
                  className={`group relative flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    isActive 
                      ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:shadow-green-500/10' 
                      : 'border-border bg-card hover:border-primary/40 hover:shadow-primary/10'
                  }`}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt="" className={`h-12 w-12 rounded-xl object-cover ring-2 transition-all ${isActive ? 'ring-green-500/50' : 'ring-border group-hover:ring-primary/30'}`} />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-base font-bold text-primary">
                      {c.name[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                      {isActive && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] text-green-500 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                  <svg className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center transition-all duration-200 hover:border-primary/30 hover:bg-card">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No communities yet</p>
            <p className="text-xs text-muted-foreground mb-4">Join communities to find your gaming squad</p>
            <Link href="/communities" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
              Browse Communities
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <LiveActivityFeed communityIds={memberCommunityIds} />
        </div>

        {/* Right Column - Friends, Squad & Conversations */}
        <div className="flex flex-col gap-4">
          <SquadFinder />
          <OnlineFriends />
          <RecentConversations />
          <SmartRecommendations userCommunities={memberCommunityIds} />
        </div>
      </div>

      {/* Trending Communities */}
      {trending && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Trending Communities
              </h2>
            </div>
            <Link href="/communities" className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              See all
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((c, i) => {
              const imgSrc = getGameImage(c.slug) || c.icon_url
              const isTop3 = i < 3
              return (
                <Link
                  key={c.id}
                  href={`/communities/${c.slug}`}
                  className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isTop3 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold text-primary/60">#{i + 1}</span>
                  )}
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
                  <span className="relative px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    Join
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Dev: Test Bot Panel */}
      <TestBotPanel />
    </div>
  )
}
