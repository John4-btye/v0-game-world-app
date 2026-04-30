'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GamerIdentityForm } from '@/components/profile/gamer-identity-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ProfileData = Partial<{
  display_name: string | null
  bio: string | null
  is_over_16: boolean | null
  discord_webhook_url: string | null
  favorite_games: unknown
  platforms: unknown
  play_style: unknown
  active_hours: unknown
  looking_for_squad: boolean | null
  squad_message: string | null
}>

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [provider, setProvider] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [webhookSaving, setWebhookSaving] = useState(false)
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [webhookTestResult, setWebhookTestResult] = useState<'success' | 'error' | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    setMounted(true)
    const load = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        setUserEmail(user.email ?? '')
        setProvider(user.app_metadata?.provider ?? '')

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setProfileData(profile as ProfileData)
          setDisplayName(profile.display_name ?? '')
          setBio(profile.bio ?? '')
          setDiscordWebhook(profile.discord_webhook_url ?? '')
        } else {
          setProfileData(null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName || null,
        bio: bio || null,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleSaveWebhook = async () => {
    setWebhookSaving(true)
    setWebhookSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_webhook_url: discordWebhook || null }),
    })
    setWebhookSaving(false)
    if (res.ok) {
      setWebhookSaved(true)
      setTimeout(() => setWebhookSaved(false), 3000)
    }
  }

  const handleTestWebhook = async () => {
    if (!discordWebhook) return
    setWebhookTesting(true)
    setWebhookTestResult(null)
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: discordWebhook }),
      })
      setWebhookTestResult(res.ok ? 'success' : 'error')
    } catch {
      setWebhookTestResult('error')
    } finally {
      setWebhookTesting(false)
      setTimeout(() => setWebhookTestResult(null), 5000)
    }
  }

  if (!mounted) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {loading ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </section>
      ) : (
        <Tabs defaultValue="profile" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="flex-none">Profile</TabsTrigger>
            <TabsTrigger value="gamer" className="flex-none">Gamer Identity</TabsTrigger>
            <TabsTrigger value="discord" className="flex-none">Discord</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-none">Appearance</TabsTrigger>
            <TabsTrigger value="account" className="flex-none">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit your display name and bio.
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label htmlFor="display-name" className="block text-sm font-medium text-foreground">
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={3}
                    className="mt-1 w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saved && (
                    <span className="text-sm font-medium text-accent">
                      Saved successfully!
                    </span>
                  )}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="gamer">
            {profileData ? (
              <section className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Gamer Identity
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Customize your gaming preferences and squad visibility.
                </p>

                <div className="mt-4">
                  <GamerIdentityForm profile={profileData} />
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  Profile data unavailable.
                </p>
              </section>
            )}
          </TabsContent>

          <TabsContent value="discord">
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Discord Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Receive notifications in Discord when you get messages, friend requests, or thread replies.
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label htmlFor="discord-webhook" className="block text-sm font-medium text-foreground">
                    Discord Webhook URL
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    Create a webhook in your Discord server: Server Settings → Integrations → Webhooks → New Webhook
                  </p>
                  <input
                    id="discord-webhook"
                    type="url"
                    value={discordWebhook}
                    onChange={(e) => setDiscordWebhook(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSaveWebhook}
                    disabled={webhookSaving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {webhookSaving ? 'Saving...' : 'Save Webhook'}
                  </button>
                  <button
                    onClick={handleTestWebhook}
                    disabled={webhookTesting || !discordWebhook}
                    className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {webhookTesting ? 'Testing...' : 'Test Webhook'}
                  </button>
                  {webhookSaved && (
                    <span className="text-sm font-medium text-accent">Saved!</span>
                  )}
                  {webhookTestResult === 'success' && (
                    <span className="text-sm font-medium text-green-500">Test sent!</span>
                  )}
                  {webhookTestResult === 'error' && (
                    <span className="text-sm font-medium text-destructive">Test failed</span>
                  )}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="appearance">
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">Appearance</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose your preferred theme for Game-World.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex h-12 w-20 items-center justify-center rounded-md bg-[oklch(0.11_0.01_280)]">
                    <div className="h-2 w-8 rounded-full bg-[oklch(0.65_0.25_265)]" />
                  </div>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Dark
                  </span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex h-12 w-20 items-center justify-center rounded-md bg-[oklch(0.97_0.005_260)] border border-[oklch(0.88_0.01_260)]">
                    <div className="h-2 w-8 rounded-full bg-[oklch(0.55_0.25_265)]" />
                  </div>
                  <span className={`text-xs font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Light
                  </span>
                </button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="account">
            <div className="flex flex-col gap-6">
              <section className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Linked Accounts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your connected sign-in method.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.18 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-foreground">Discord</p>
                        <p className="text-xs text-muted-foreground">{userEmail || 'Connected'}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      provider === 'discord'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {provider === 'discord' ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-destructive/30 bg-card p-6">
                <h2 className="text-lg font-semibold text-card-foreground">Account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign out of your Game-World account.
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Sign Out
                </button>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}


