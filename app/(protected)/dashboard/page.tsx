/**
 * Dashboard — home feed after login.
 * Will show: recently active communities, friend activity, and quick actions.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to Game-World. Your communities, friends, and messages will
        appear here.
      </p>

      {/* Placeholder sections */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Your Communities
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Communities you have joined will appear here.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Friend Activity
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          See what your friends are up to.
        </p>
      </section>
    </div>
  )
}
