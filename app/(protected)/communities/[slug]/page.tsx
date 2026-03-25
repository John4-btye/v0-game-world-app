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
    .select('*')
    .eq('community_id', community.id)
    .order('position', { ascending: true })
    .returns<Channel[]>()

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
              <span className="h-2 w-2 rounded-full bg-green-500" />
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
          <Link
            href={`/communities/${slug}/threads`}
            className="mb-4 flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Discussions
          </Link>
          <ChannelList
            channels={(channels ?? []).map(c => ({ ...c, created_by: (c as { created_by?: string | null }).created_by ?? null }))}
            communityId={community.id}
            communitySlug={slug}
            currentUserId={user?.id ?? ''}
          />
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
