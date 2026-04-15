'use client'

import useSWR from 'swr'
import { JumpBackIn } from './jump-back-in'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface DashboardData {
  jumpBackIn: {
    lastChannel: { id: string; name: string; communityName: string; communitySlug: string } | null
    lastDm: { id: string; partnerName: string } | null
  }
}

export function JumpBackInClient() {
  const { data } = useSWR<DashboardData>('/api/dashboard', fetcher)

  if (!data?.jumpBackIn) return null

  return (
    <JumpBackIn 
      lastChannel={data.jumpBackIn.lastChannel} 
      lastDm={data.jumpBackIn.lastDm} 
    />
  )
}
