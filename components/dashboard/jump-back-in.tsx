'use client'

import Link from 'next/link'

interface JumpBackInProps {
  lastChannel: {
    id: string
    name: string
    communityName: string
    communitySlug: string
  } | null
  lastDm: {
    id: string
    partnerName: string
  } | null
}

export function JumpBackIn({ lastChannel, lastDm }: JumpBackInProps) {
  if (!lastChannel && !lastDm) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Jump Back In
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {lastChannel && (
          <Link
            href={`/communities/${lastChannel.communitySlug}?channel=${lastChannel.id}`}
            className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Last channel</p>
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                #{lastChannel.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{lastChannel.communityName}</p>
            </div>
            <svg className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {lastDm && (
          <Link
            href={`/messages/${lastDm.id}`}
            className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Last conversation</p>
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {lastDm.partnerName}
              </p>
            </div>
            <svg className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
