/**
 * Settings page — user preferences, privacy, and account management.
 * Sections: Profile editing, privacy/safety, notifications, linked accounts.
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Profile
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit your display name, bio, and avatar.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Privacy &amp; Safety
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          NSFW content filtering, blocked users, and data privacy options.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Notifications
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure how you receive alerts for messages, friend requests, and
          community activity.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Linked Accounts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your Discord, Google, and Reddit connections.
        </p>
      </section>
    </div>
  )
}
