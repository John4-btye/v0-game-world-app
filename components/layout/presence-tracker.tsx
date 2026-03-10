'use client'

import { usePresence } from '@/hooks/use-presence'

export function PresenceTracker() {
  usePresence()
  return null
}
