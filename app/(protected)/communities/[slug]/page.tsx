import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Community, Channel } from '@/lib/types'
import { JoinButton } from '@/components/communities/join-button'
import { MembersPanel } from '@/components/communities/members-panel'

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: community } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single<Community>()

  if (!community) notFound()

  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('community_id', community.id)
    .order('position', { ascending: true })
    .returns<Channel[]>()

  const { count: memberCount } = await supabase
    .from('community_members')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', community.id)

  const { data: { user } } = await supabase.auth.getUser()
  let isMember = false
  if (user) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .maybeSingle()
    isMember = !!membership
  }

  const visibleTags = community.game_tags?.slice(0, 10) ?? []
  const generalChannel = channels?.find((c) => c.name === 'general')

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/communities"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Communities
      </Link>

      {/* Community header */}
      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={`${community.name} icon`}
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-2xl font-bold text-primary">
            {community.name[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground">{community.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {community.description}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {memberCount ?? 0} member{memberCount !== 1 ? 's' : ''}
            </span>
            <JoinButton communityId={community.id} isMember={isMember} />
          </div>
        </div>
      </div>

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Channels + content + members */}
      <div className="flex gap-4">
        <aside className="w-52 shrink-0 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Channels
          </h2>
          {channels && channels.length > 0 ? (
            <nav className="flex flex-col gap-1">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/communities/${slug}/${channel.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <span className="text-xs opacity-60">#</span>
                  {channel.name}
                </Link>
              ))}
            </nav>
          ) : (
            <p className="text-xs text-muted-foreground">No channels yet.</p>
          )}
        </aside>

        <section className="flex-1 rounded-lg border border-border bg-card p-6">
          {isMember ? (
            generalChannel ? (
              <div className="text-center">
                <h2 className="text-sm font-semibold text-card-foreground">
                  Welcome to {community.name}!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;re a member. Head to a channel to start chatting.
                </p>
                <Link
                  href={`/communities/${slug}/${generalChannel.id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span className="text-xs">#</span> Open #general
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;re a member. No channels have been created yet.
              </p>
            )
          ) : (
            <div className="text-center">
              <h2 className="text-sm font-semibold text-card-foreground">
                Join {community.name} to chat
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Join this community to access channels, send messages, and connect with other gamers.
              </p>
            </div>
          )}
        </section>

        {/* Members sidebar */}
        {isMember && (
          <aside className="w-52 shrink-0 rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Members
            </h2>
            <MembersPanel communityId={community.id} />
          </aside>
        )}
      </div>
    </div>
  )
}
