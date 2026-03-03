/**
 * Community detail page — shows channels list and community info.
 * The [slug] param identifies the community.
 */
export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">
        Community: {slug}
      </h1>

      {/* Channel list sidebar + community info will go here */}
      <div className="flex gap-4">
        <aside className="w-60 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-card-foreground">
            Channels
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Channel list will load here.
          </p>
        </aside>

        <section className="flex-1 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-card-foreground">
            Community Info
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Description, members, game tags, and rules.
          </p>
        </section>
      </div>
    </div>
  )
}
