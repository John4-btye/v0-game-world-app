import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChannelChat } from '@/components/chat/channel-chat'

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string; channelId: string }>
}) {
  const { slug, channelId } = await params
  const supabase = await createClient()

  // Verify community exists
  const { data: community } = await supabase
    .from('communities')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  // Verify channel exists in this community
  const { data: channel } = await supabase
    .from('channels')
    .select('id, name, community_id')
    .eq('id', channelId)
    .eq('community_id', community.id)
    .single()

  if (!channel) notFound()

  // Check membership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: membership } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    redirect(`/communities/${slug}`)
  }

  // Fetch all channels for sidebar
  const { data: channels } = await supabase
    .from('channels')
    .select('id, name')
    .eq('community_id', community.id)
    .order('position', { ascending: true })

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Channel sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card p-3">
        <Link
          href={`/communities/${slug}`}
          className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {community.name}
        </Link>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </h2>
        <nav className="flex flex-col gap-0.5">
          {channels?.map((ch) => (
            <Link
              key={ch.id}
              href={`/communities/${slug}/${ch.id}`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                ch.id === channelId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span className="text-xs opacity-60">#</span>
              {ch.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Channel header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">#</span>
          <h1 className="text-sm font-semibold text-foreground">{channel.name}</h1>
          <span className="text-xs text-muted-foreground">in {community.name}</span>
        </div>

        {/* Chat */}
        <div className="flex-1">
          <ChannelChat channelId={channelId} channelName={channel.name} />
        </div>
      </div>
    </div>
  )
}
