// Dev-only fake users for testing interactions
export interface FakeUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  status: 'online' | 'away' | 'offline'
  isRealUser?: boolean
}

// Use UUID-like IDs to prevent collisions with real user IDs
export const FAKE_USERS: FakeUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'shadowblade',
    display_name: 'ShadowBlade',
    avatar_url: null,
    status: 'online',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'pixelwarrior',
    display_name: 'PixelWarrior',
    avatar_url: null,
    status: 'online',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'nightowl_gamer',
    display_name: 'NightOwl',
    avatar_url: null,
    status: 'away',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'prosniper99',
    display_name: 'ProSniper99',
    avatar_url: null,
    status: 'offline',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'speedrunner',
    display_name: 'SpeedRunner',
    avatar_url: null,
    status: 'online',
  },
]
