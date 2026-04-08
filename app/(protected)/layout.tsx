import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { PresenceTracker } from '@/components/layout/presence-tracker'
import { DevUserProvider } from '@/lib/dev/dev-user-context'
import { DevControlsPanel } from '@/components/dev/dev-controls-panel'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <DevUserProvider>
      <div className="flex h-svh bg-background">
        <PresenceTracker />
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
        <DevControlsPanel />
      </div>
    </DevUserProvider>
  )
}
