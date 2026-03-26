import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Community } from '@/lib/types'
import { JoinButton } from '@/components/communities/join-button'
import { MembersPanel } from '@/components/communities/members-panel'
import { ChannelList } from '@/components/communities/channel-list'
import { DeleteCommunityButton } from '@/components/communities/delete-community-button'
import { getGameImage } from '@/lib/game-images'

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
    .eq('is_deleted', false)
    .single<Community>()

  if (!community) notFound()

  const { data: channels } = await supabase
    .from('channels')
    .select('id, name, description, type, position, created_by')
    .eq('community_id', community.id)
    .order('position', { ascending: true })

  const { count: memberCount } = await supabase
    .from('community_members')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', community.id)

  // Get online count (users active in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: memberIds } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', community.id)
  
  let onlineCount = 0
  if (memberIds && memberIds.length > 0) {
    const { count } = await supabase
      .from('user_presence')
      .select('id', { count: 'exact', head: true })
      .in('user_id', memberIds.map(m => m.user_id))
      .gte('last_seen', fiveMinutesAgo)
    onlineCount = count ?? 0
  }

  const { data: { user } } = await supabase.auth.getUser()
  let isMember = false
  const isOwner = user?.id === community.created_by
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
  const generalChannel = channels?.find((c) => c.name === 'general') || channels?.[0]

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/communities"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all duration-150"
      >
        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Communities
      </Link>

      {/* Community header */}
      <div className="flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
        {(() => {
          const imgSrc = getGameImage(community.slug) || community.icon_url
          return imgSrc ? (
            <img
              src={imgSrc}
              alt={`${community.name} icon`}
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-2xl font-bold text-primary">
              {community.name[0]}
            </div>
          )
        })()}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground">{community.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {community.description}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {memberCount ?? 0} member{memberCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-green-500 block" />
              </span>
              {onlineCount} online
            </span>
            <JoinButton communityId={community.id} isMember={isMember} />
            {isOwner && (
              <DeleteCommunityButton communityId={community.id} communityName={community.name} />
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all duration-150 hover:bg-primary/20 hover:text-primary hover:scale-105 cursor-default select-none"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Channels + content + members */}
      <div className="flex gap-4">
        <aside className="w-52 shrink-0 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
          <Link
            href={`/communities/${slug}/threads`}
            className="group mb-4 flex items-center gap-2.5 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Discussions
            <svg className="h-3 w-3 ml-auto opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <ChannelList
            channels={(channels ?? []).map(c => ({ ...c, created_by: c.created_by ?? null }))}
            communityId={community.id}
            communitySlug={slug}
            currentUserId={user?.id ?? ''}
          />
        </aside>

        <section className="flex-1 rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20">
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
                  className="group mt-5 inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                >
                  <span className="text-primary-foreground/70">#</span>
                  <span>Enter #{generalChannel.name}</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
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
<aside className="w-52 shrink-0 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
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
