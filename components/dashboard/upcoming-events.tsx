'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type UpcomingEvent = {
  id: string
  title: string
  starts_at: string // ISO
  location: string | null
  notes: string | null
}

const STORAGE_KEY = 'gw_upcoming_events_v1'

function safeParse(json: string | null): UpcomingEvent[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean) as UpcomingEvent[]
  } catch {
    return []
  }
}

function formatWhen(startsAtIso: string) {
  const d = new Date(startsAtIso)
  if (Number.isNaN(d.getTime())) return 'Unknown time'
  return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState(() => {
    const nowPlus30 = new Date(Date.now() + 30 * 60 * 1000)
    return toDatetimeLocalValue(nowPlus30.toISOString())
  })
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setEvents(safeParse(localStorage.getItem(STORAGE_KEY)))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(null), 2500)
    return () => clearTimeout(t)
  }, [successMsg])

  const upcoming = useMemo(() => {
    const now = Date.now()
    return [...events]
      .filter((e) => {
        const t = new Date(e.starts_at).getTime()
        return Number.isFinite(t) && t >= now
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 5)
  }, [events])

  const canCreate = title.trim().length > 0 && startsAt.trim().length > 0

  const onCreate = () => {
    if (!canCreate) return
    const startsAtIso = new Date(startsAt).toISOString()
    const event: UpcomingEvent = {
      id: crypto.randomUUID(),
      title: title.trim(),
      starts_at: startsAtIso,
      location: location.trim() ? location.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
    }
    setEvents((prev) => [event, ...prev].slice(0, 25))
    setSuccessMsg(`Scheduled “${event.title}”`)
    setTitle('')
    setLocation('')
    setNotes('')
    setShowCreate(false)
  }

  const onDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-base" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Upcoming / Scheduled Events
        </CardTitle>
        <CardDescription>
          Quick reminders for scrims, raids, and community meetups.
        </CardDescription>
        <CardAction>
          <Button
            variant={showCreate ? 'secondary' : 'default'}
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? 'Close' : 'Add event'}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-primary/5 px-3 py-2 text-sm text-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="truncate">{successMsg}</span>
          </div>
        )}

        {showCreate && (
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Among Us night, Rocket League tourney, etc."
                  className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">When</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Location (optional)</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Among Us community"
                  className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Bring 8 players, use voice chat, etc."
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!canCreate} onClick={onCreate}>
                Schedule
              </Button>
            </div>
          </div>
        )}

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">No events scheduled</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a quick reminder so you don’t miss the next session.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
              Add your first event
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatWhen(e.starts_at)}
                        {e.location ? ` • ${e.location}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-secondary transition-all"
                      title="Remove event"
                      aria-label="Remove event"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {e.notes && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{e.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

