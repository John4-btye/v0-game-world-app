import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getGameImage } from '@/lib/game-images'

export default async function JoinedCommunitiesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all user's communities
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, joined_at, communities(id, name, slug, icon_url, description)')
    .eq('user_id', user?.id ?? '')
    .order('joined_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Your Communities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {memberships?.length || 0} communities joined
          </p>
        </div>
        <Link
          href="/communities"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Find More
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </div>

      {memberships && memberships.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m: Record<string, unknown>) => {
            const c = m.communities as { id: string; name: string; slug: string; icon_url: string | null; description: string | null } | null
            if (!c) return null
            const imgSrc = getGameImage(c.slug) || c.icon_url
            const joinedAt = m.joined_at ? new Date(m.joined_at as string).toLocaleDateString() : null
            return (
              <Link
                key={m.community_id as string}
                href={`/communities/${c.slug}`}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
              >
                {imgSrc ? (
                  <img src={imgSrc} alt="" className="h-14 w-14 rounded-xl object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
                    {c.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  {joinedAt && (
                    <p className="text-[10px] text-muted-foreground mt-1">Joined {joinedAt}</p>
                  )}
                </div>
                <svg className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-base font-medium text-foreground mb-1">No communities yet</p>
          <p className="text-sm text-muted-foreground mb-5">Join communities to connect with other gamers</p>
          <Link href="/communities" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
            Browse Communities
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
