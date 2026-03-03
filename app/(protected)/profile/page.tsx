/**
 * Profile page — shows the current user's profile info.
 * Will display: avatar, display name, bio, linked accounts, communities joined.
 */
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>

      <div className="flex gap-6">
        {/* Avatar placeholder */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-secondary-foreground">
          ?
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">
            Display Name
          </p>
          <p className="text-sm text-muted-foreground">@username</p>
          <p className="text-sm text-muted-foreground">
            Bio will appear here.
          </p>
        </div>
      </div>

      {/* Linked accounts */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Linked Accounts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Discord and Google account links will be shown here.
        </p>
      </section>
    </div>
  )
}
