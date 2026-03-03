/**
 * Channel chat view — shows messages in a specific channel.
 * Params: slug (community), channelId (channel).
 */
export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string; channelId: string }>
}) {
  const { slug, channelId } = await params

  return (
    <div className="flex h-full flex-col">
      {/* Channel header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">
          #{channelId}
        </h1>
        <p className="text-xs text-muted-foreground">
          in {slug}
        </p>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Messages will appear here. Chat input at the bottom.
        </p>
      </div>

      {/* Message input stub */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-input bg-input px-4 py-2 text-sm text-muted-foreground">
          Message #{channelId}...
        </div>
      </div>
    </div>
  )
}
