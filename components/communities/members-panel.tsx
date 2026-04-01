'use client'

import { useEffect, useState } from 'react'
import { AddFriendButton } from '@/components/friends/add-friend-button'
import { useRouter } from 'next/navigation'

interface Member {
  user_id: string
  role: string
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  friendship: { id: string; status: string } | null
  is_self: boolean
  online_status?: 'online' | 'away' | 'offline'
}

export function MembersPanel({ communityId, channelId }: { communityId: string; channelId?: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch(`/api/communities/${communityId}/members`)
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetchMembers()
  }, [communityId])

  const handleMessage = async (partnerId: string) => {
    const res = await fetch('/api/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: partnerId }),
    })
    const data = await res.json()
    if (data.id) router.push(`/messages/${data.id}`)
  }

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground">Loading members...</div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">No members yet.</div>
    )
  }

  const admins = members.filter((m) => m.role === 'admin' || m.role === 'moderator')
  const regulars = members.filter((m) => m.role === 'member')

  return (
    <div className="flex flex-col gap-4">
      {admins.length > 0 && (
        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Moderators -- {admins.length}
          </h3>
          <div className="flex flex-col gap-1">
            {admins.map((m) => (
              <MemberRow
                key={m.user_id}
                member={m}
                onMessage={handleMessage}
                channelId={channelId}
              />
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Members -- {regulars.length}
        </h3>
        <div className="flex flex-col gap-1">
          {regulars.map((m) => (
            <MemberRow
              key={m.user_id}
              member={m}
              onMessage={handleMessage}
              channelId={channelId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MemberRow({
  member,
  onMessage,
  channelId,
}: {
  member: Member
  onMessage: (id: string) => void
  channelId?: string
}) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)
  const displayName = member.profile?.display_name ?? member.profile?.username ?? 'User'
  const friendStatus = member.friendship?.status as 'pending' | 'accepted' | 'blocked' | undefined
  
  // Copy mention to clipboard for easy pasting
  const handleCopyMention = () => {
    if (member.profile?.username) {
      navigator.clipboard.writeText(`@${member.profile.username}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="group relative flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative">
        {member.profile?.avatar_url ? (
          <img
            src={member.profile.avatar_url}
            alt={`${displayName}'s avatar`}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        {/* Online indicator */}
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
          member.online_status === 'online' ? 'bg-green-500' : 
          member.online_status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/30'
        }`}>
          {member.online_status === 'online' && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
          )}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {displayName}
          {member.is_self && (
            <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>
          )}
        </p>
      </div>

      {showActions && !member.is_self && (
        <div className="flex items-center gap-1">
          {/* Copy @mention button */}
          <button
            onClick={handleCopyMention}
            className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title={copied ? 'Copied!' : 'Copy @mention'}
            aria-label={`Copy mention for ${displayName}`}
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => onMessage(member.user_id)}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Send message"
            aria-label={`Message ${displayName}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <AddFriendButton
            targetUserId={member.user_id}
            existingStatus={friendStatus ?? null}
            size="sm"
          />
        </div>
      )}
    </div>
  )
}
