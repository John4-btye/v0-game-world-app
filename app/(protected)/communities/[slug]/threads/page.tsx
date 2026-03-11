'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Thread {
  id: string
  title: string
  content: string
  created_at: string
  reply_count: number
  like_count: number
  is_pinned: boolean
  profiles: { username: string; display_name: string | null; avatar_url: string | null }
}

export default function ThreadsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [communityId, setCommunityId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetch(`/api/communities?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data?.[0]?.id) setCommunityId(data[0].id)
      })
  }, [slug])

  const { data: threads, mutate } = useSWR<Thread[]>(
    communityId ? `/api/communities/${communityId}/threads` : null,
    fetcher
  )

  // Subscribe to realtime for instant thread updates
  useEffect(() => {
    if (!communityId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`threads:${communityId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'threads',
        filter: `community_id=eq.${communityId}`,
      }, () => mutate())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [communityId, mutate])

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || !communityId) return
    setPosting(true)
    try {
      const res = await fetch(`/api/communities/${communityId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        setTitle('')
        setContent('')
        setShowForm(false)
        mutate()
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/communities/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to community
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-outfit)' }}>
            Discussions
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Thread'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <input
            type="text"
            placeholder="Thread title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <Button onClick={handlePost} disabled={posting || !title.trim() || !content.trim()}>
            {posting ? 'Posting...' : 'Post Thread'}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {!communityId && <p className="text-center text-muted-foreground py-8">Loading...</p>}
        {communityId && threads?.map((thread) => (
          <Link
            key={thread.id}
            href={`/communities/${slug}/threads/${thread.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              {thread.profiles?.avatar_url ? (
                <img src={thread.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {thread.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {thread.is_pinned && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Pinned</span>
                  )}
                  <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{thread.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{thread.profiles?.display_name || thread.profiles?.username}</span>
                  <span>{thread.reply_count} replies</span>
                  <span>{thread.like_count} likes</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {communityId && threads && threads.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No threads yet. Start a discussion!</p>
        )}
      </div>
    </div>
  )
}
